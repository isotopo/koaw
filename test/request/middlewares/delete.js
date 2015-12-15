'use strict'

const assert = require('assert')
const Koaw = require('../../../lib')
const request = require('supertest')
const server = require('../../fixtures/server')
const sinon = require('sinon')
const waterline = require('../../fixtures/waterline')

describe('delete middleware', function () {
  before(function *() {
    this.server = yield server()
    this.waterline = yield waterline()
  })

  after(function () {
    this.waterline.teardown()
  })

  it('should be executed before and after of main handler', function *() {
    let spy = sinon.spy()

    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })

    controller
      .methods('delete')
      .before('delete', function *(next) {
        spy('before.once')
        yield next
      })
      .before('delete', function *(next) {
        spy('before.twice')
        yield next
      })
      .after('delete', function *(next) {
        spy('after.once')
        yield next
      })
      .after('delete', function *(next) {
        spy('after.twice')
        yield next
      })
      .register(this.server)

    // Create document
    yield request(this.server.listen()).delete(controller._path + '/124')

    assert.equal(spy.callCount, 4)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'after.once')
    assert.equal(spy.args[3][0], 'after.twice')
  })

  it('should be executed before and after of custom route', function *() {
    let spy = sinon.spy()

    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })

    controller
      .route('delete', '/custom', function *(next) {
        spy('handler')
        this.status = 204
        yield next
      })
      .before('delete', '/custom', function *(next) {
        spy('before.once')
        yield next
      })
      .before('delete', '/custom', function *(next) {
        spy('before.twice')
        yield next
      })
      .after('delete', '/custom', function *(next) {
        spy('after.once')
        yield next
      })
      .after('delete', '/custom', function *(next) {
        spy('after.twice')
        yield next
      })
      .register(this.server)

    // Request
    yield request(this.server.listen())
      .delete(`${controller._path}/custom`)
      .expect(204)

    assert.equal(spy.callCount, 5)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'handler')
    assert.equal(spy.args[3][0], 'after.once')
    assert.equal(spy.args[4][0], 'after.twice')
  })
})
