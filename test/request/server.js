'use strict'

const assert = require('assert')
const faker = require('faker')
const Koaw = require('../../lib')
const request = require('supertest')
const server = require('../fixtures/server')
const sinon = require('sinon')
const waterline = require('../fixtures/waterline')
const Waterline = require('waterline')

describe('server', function () {
  before(function *() {
    this.server = yield server()
    this.waterline = yield waterline()
    this.agent = request(this.server.listen())

    this.controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })

    this.controller.methods('post get put delete')
    this.controller.register(this.server)

    this.params = {
      name: faker.lorem.words()[0],
      description: faker.lorem.paragraph()
    }
  })

  after(function () {
    this.waterline.teardown()
  })

  it('should have route to create a document', function *() {
    let response = yield this.agent
      .post(this.controller._path)
      .send(this.params)
      .expect(201)

    this.id = response.body.id

    assert(response.body.id)
    assert.equal(response.body.name, this.params.name)
    assert.equal(response.body.description, this.params.description)
  })

  it('should have route to get a collection', function *() {
    let response = yield this.agent
      .get(this.controller._path)
      .expect(200)

    assert(Array.isArray(response.body))
    let created = response.body.filter(store => store.id === this.id)
    assert.equal(created[0].name, this.params.name)
    assert.equal(created[0].description, this.params.description)
  })

  it('should have route to get a document', function *() {
    let response = yield this.agent
      .get(`${this.controller._path}/${this.id}`)
      .expect(200)

    assert.equal(response.body.name, this.params.name)
    assert.equal(response.body.description, this.params.description)
  })

  it('should have route to update a document', function *() {
    let name = faker.lorem.words()[0]
    let response = yield this.agent
      .put(`${this.controller._path}/${this.id}`)
      .send({ name: name })
      .expect(200)

    assert.equal(response.body.name, name)
    assert.notEqual(response.body.name, this.params.name)
    assert.equal(response.body.description, this.params.description)
  })

  it('should have route to delete a document', function *() {
    yield this.agent
      .delete(`${this.controller._path}/${this.id}`)
      .expect(204)
  })

  it('should set `this.waterline` to middleware', function *() {
    let spy = sinon.spy()

    let handler = function *(next) {
      spy(this.waterline)
      this.status = 200
      yield next
    }

    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })
    .override('get put post delete', handler)
    .route('get put delete', '/nested/123', handler)
    .register(this.server)

    yield this.agent.post(controller._path).send(this.params)
    yield this.agent.get(controller._path)
    yield this.agent.get(`${controller._path}/123`)
    yield this.agent.put(`${controller._path}/123`).send(this.params)
    yield this.agent.delete(`${controller._path}/123`)
    yield this.agent.get(`${controller._path}/nested/123`)
    yield this.agent.put(`${controller._path}/nested/123`)
    yield this.agent.delete(`${controller._path}/nested/123`)

    assert.equal(spy.callCount, 8)

    for (let i = 0; i < spy.callCount; i++) {
      assert(spy.args[i][0], 'waterline object does not exists!')
      assert(spy.args[i][0] instanceof Waterline)
    }
  })

  it('should set `this.koaw` to middleware', function *() {
    let spy = sinon.spy()
    let handler = function *(next) {
      spy(this.koaw)
      this.status = 200
      yield next
    }

    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })
    .override('get put post delete', handler)
    .route('get put delete', '/nested/123', handler)
    .register(this.server)

    yield this.agent.post(controller._path).send(this.params)
    yield this.agent.get(controller._path)
    yield this.agent.get(`${controller._path}/123`)
    yield this.agent.put(`${controller._path}/123`).send(this.params)
    yield this.agent.delete(`${controller._path}/123`)
    yield this.agent.get(`${controller._path}/nested/123`)
    yield this.agent.put(`${controller._path}/nested/123`)
    yield this.agent.delete(`${controller._path}/nested/123`)

    assert.equal(spy.callCount, 8)

    for (let i = 0; i < spy.callCount; i++) {
      let koaw = spy.args[i][0]
      assert(koaw)
      assert(koaw.query)
    }
  })
})
