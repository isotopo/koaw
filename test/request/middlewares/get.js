'use strict'

const assert = require('assert')
const Koaw = require('../../../lib')
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

  it('should be executed before a main handler', function *() {
    let spy = sinon.spy()

    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })

    controller
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
    yield request(this.server.listen()).get(controller._path)

    assert.equal(spy.callCount, 4)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'after.once')
    assert.equal(spy.args[3][0], 'after.twice')

    // Reset spy
    spy.reset()

    // Get single
    yield request(this.server.listen()).get(controller._path + '/123')

    assert.equal(spy.callCount, 4)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'after.once')
    assert.equal(spy.args[3][0], 'after.twice')
  })
})
