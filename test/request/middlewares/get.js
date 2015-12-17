'use strict'

const assert = require('assert')
const Koaw = require('../../../lib')
const faker = require('faker')
const request = require('supertest')
const server = require('../../fixtures/server')
const sinon = require('sinon')
const waterline = require('../../fixtures/waterline')

describe('get middleware', function () {
  before(function *() {
    this.server = yield server()
    this.waterline = yield waterline()
  })

  after(function () {
    this.waterline.teardown()
  })

  beforeEach(function () {
    this.controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })
  })

  it('should be executed before and after of main handler', function *() {
    let spy = sinon.spy()

    this.controller
      .methods('get')
      .before('get', function *(next) {
        spy('before.once')
        yield next
      })
      .before('get', function *(next) {
        spy('before.twice')
        yield next
      })
      .after('get', function *(next) {
        spy('after.once')
        yield next
      })
      .after('get', function *(next) {
        spy('after.twice')
        yield next
      })
      .register(this.server)

    // Get collection
    yield request(this.server.listen()).get(this.controller._path)

    assert.equal(spy.callCount, 4)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'after.once')
    assert.equal(spy.args[3][0], 'after.twice')

    // Reset spy
    spy.reset()

    // Get single
    yield request(this.server.listen()).get(this.controller._path + '/123')

    assert.equal(spy.callCount, 4)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'after.once')
    assert.equal(spy.args[3][0], 'after.twice')
  })

  it('should be executed before and after of custom route', function *() {
    let spy = sinon.spy()

    this.controller
      .route('get', '/nested/123', function *(next) {
        spy('handler')
        this.status = 200
        yield next
      })
      .before('get', '/nested/123', function *(next) {
        spy('before.once')
        yield next
      })
      .before('get', '/nested/123', function *(next) {
        spy('before.twice')
        yield next
      })
      .after('get', '/nested/123', function *(next) {
        spy('after.once')
        yield next
      })
      .after('get', '/nested/123', function *(next) {
        spy('after.twice')
        yield next
      })
      .register(this.server)

    // Request
    yield request(this.server.listen())
      .get(`${this.controller._path}/nested/123`)
      .expect(200)

    assert.equal(spy.callCount, 5)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'handler')
    assert.equal(spy.args[3][0], 'after.once')
    assert.equal(spy.args[4][0], 'after.twice')
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
    .before('get', function *(next) {
      this.koaw.query = query
      yield next
    })
    .register(this.server)

    yield this.waterline.collections.store.create({
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
      .get(this.controller._path)
      .expect(200)

    yield this.waterline.collections.store.destroy({ owner: query.owner })

    assert(Array.isArray(res.body))
    assert.equal(res.body.length, 1)
    assert.equal(res.body[0].name, params.name)
    assert.equal(res.body[0].description, params.description)
    assert.equal(res.body[0].owner, query.owner)
  })
})
