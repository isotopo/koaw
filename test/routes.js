'use strict'

const assert = require('assert')
const faker = require('faker')
const RestController = require('../lib')
const request = require('supertest')
const server = require('./fixtures/server')
const orm = require('./fixtures/orm')
const sinon = require('sinon')

describe('controller#register', function () {
  before(function *() {
    this.server = yield server()
    this.orm = yield orm()
    this.model = this.orm.collections.store
    this.agent = request(this.server.listen())
  })

  it('should fail when trying to register routes', function (done) {
    let controller = new RestController(this.model)
    try {
      controller.register()
      done('Should have failed when not specify a server')
    } catch (e) {
      assert.equal(e.message, 'Controller needs a server to register routes')
      done()
    }
  })

  it('should set a server property as private instance property', function () {
    let controller = new RestController(this.model)
    controller.register(this.server)
    assert(controller._server)
  })

  it('should ensure to use a middleware server', function (done) {
    let controller = new RestController(this.model)
    try {
      controller.register({ method: function () {} })
      done('Should have failed when is not a koa server')
    } catch (e) {
      assert.equal(e.message, 'Controller needs a middleware server to register routes')
      done()
    }
  })

  before(function () {
    this.controller = new RestController(this.model)
    this.controller.methods('post get')
    this.controller.register(this.server)

    this.params = {
      name: faker.lorem.words()[0],
      description: faker.lorem.paragraph()
    }
  })

  it('should set route through server.use method', function *() {
    let spy = sinon.spy(this.server, 'use')
    let controller = new RestController(this.model)
    controller.register(this.server)
    // create, collection, single, update, delete
    assert.equal(spy.callCount, 5)
  })

  it('should set route to create a document', function *() {
    let response = yield this.agent
      .post(this.controller._path)
      .send(this.params)
      .expect(201)

    this.id = response.body.id

    assert(response.body.id)
    assert.equal(response.body.name, this.params.name)
    assert.equal(response.body.description, this.params.description)

    let doc = yield this.controller.model.findOne({ id: this.id })
    assert.equal(this.params.name, doc.name)
    assert.equal(this.params.description, doc.description)
  })

  it('should set route to get a collection', function *() {
    let response = yield this.agent
      .get(this.controller._path)
      .expect(200)

    assert(Array.isArray(response.body))
    let created = response.body.filter(store => store.id === this.id)
    assert.equal(created[0].name, this.params.name)
    assert.equal(created[0].description, this.params.description)
  })

  it('should set route to get a document', function *() {
    let response = yield this.agent
      .get(`${this.controller._path}/${this.id}`)
      .expect(200)

    assert.equal(response.body.name, this.params.name)
    assert.equal(response.body.description, this.params.description)
  })

  it('should set route to update a document', function *() {
    let name = faker.lorem.words()[0]
    let response = yield this.agent
      .put(`${this.controller._path}/${this.id}`)
      .send({ name: name })
      .expect(200)

    assert.equal(response.body.name, name)
    assert.notEqual(response.body.name, this.params.name)
    assert.equal(response.body.description, this.params.description)
  })

  it('should set route to delete a document', function *() {
    yield this.agent
      .delete(`${this.controller._path}/${this.id}`)
      .expect(204)
  })

  after(function () {
    this.orm.teardown()
  })
})
