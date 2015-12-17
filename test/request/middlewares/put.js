'use strict'

const assert = require('assert')
const Koaw = require('../../../lib')
const request = require('supertest')
const server = require('../../fixtures/server')
const sinon = require('sinon')
const waterline = require('../../fixtures/waterline')
const faker = require('faker')

describe('put middleware', function () {
  before(function *() {
    this.server = yield server()
    this.waterline = yield waterline()
  })

  after(function () {
    this.waterline.teardown()
  })

  beforeEach(function *() {
    this.controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })
  })

  it('should be executed before and after of main handler', function *() {
    let spy = sinon.spy()

    this.controller
      .methods('put')
      .before('put', function *(next) {
        spy('before.once')
        yield next
      })
      .before('put', function *(next) {
        spy('before.twice')
        yield next
      })
      .after('put', function *(next) {
        spy('after.once')
        yield next
      })
      .after('put', function *(next) {
        spy('after.twice')
        yield next
      })
      .register(this.server)

    // Create document
    yield request(this.server.listen()).put(this.controller._path + '/124').send({
      name: faker.lorem.words()[0],
      description: faker.lorem.paragraph()
    })

    assert.equal(spy.callCount, 4)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'after.once')
    assert.equal(spy.args[3][0], 'after.twice')
  })

  it('should be executed before and after of custom route', function *() {
    let spy = sinon.spy()

    this.controller
      .route('put', '/nested/123', function *(next) {
        spy('handler')
        this.status = 200
        yield next
      })
      .before('put', '/nested/123', function *(next) {
        spy('before.once')
        yield next
      })
      .before('put', '/nested/123', function *(next) {
        spy('before.twice')
        yield next
      })
      .after('put', '/nested/123', function *(next) {
        spy('after.once')
        yield next
      })
      .after('put', '/nested/123', function *(next) {
        spy('after.twice')
        yield next
      })
      .register(this.server)

    // Request
    yield request(this.server.listen())
      .put(`${this.controller._path}/nested/123`)
      .expect(200)

    assert.equal(spy.callCount, 5)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'handler')
    assert.equal(spy.args[3][0], 'after.once')
    assert.equal(spy.args[4][0], 'after.twice')
  })

  it('should not reject when not sending a required property', function *() {
    this.controller
    .methods('put')
    .register(this.server)

    let fields = yield this.waterline.collections.store.find()

    yield request(this.server.listen())
      .put(this.controller._path + '/' + fields[0].id)
      .send({
        description: faker.lorem.paragraph()
      })
      .expect(200)
  })

  it('should not reject by validator when is a custom route', function *() {
    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })

    .route('put', '/nested/123', function *(next) {
      this.status = 200
      yield next
    })
    .register(this.server)

    yield request(this.server.listen())
      .put(`${controller._path}/nested/123`)
      .send({
        name: 1,
        description: faker.lorem.paragraph(),
        active: false
      })
      .expect(200)
  })

  it('should set a query', function *() {
    let params = {
      name: faker.lorem.words()[0],
      description: faker.lorem.paragraph()
    }

    let query = {
      owner: 'mine'
    }

    this.controller
    .before('put', function *(next) {
      this.koaw.query = query
      yield next
    })
    .register(this.server)

    let store = yield this.waterline.collections.store.create({
      name: params.name,
      description: params.description,
      owner: query.owner
    })

    yield this.waterline.collections.store.create({
      name: faker.lorem.words()[0],
      description: faker.lorem.paragraph()
    })

    // Request
    let res = yield request(this.server.listen())
      .put(this.controller._path + '/' + store.id)
      .send({ description: 'meh' })
      .expect(200)

    yield this.waterline.collections.store.destroy({ owner: query.owner })

    assert.equal(res.body.name, params.name)
    assert.equal(res.body.description, 'meh')
    assert.equal(res.body.owner, query.owner)
  })
})
