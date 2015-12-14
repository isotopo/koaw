'use strict'

const assert = require('assert')
const Koaw = require('../lib')
const server = require('./fixtures/server')
const request = require('supertest')
const sinon = require('sinon')
const waterline = require('./fixtures/waterline')

describe('controller.override()', function () {
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

  it('should return an instance to be chained', function () {
    let handler = function *(next) { yield next }
    assert.equal(this.controller, this.controller.override('post', handler))
  })

  it('should replace handler of methods', function *() {
    let spy = sinon.spy()
    let handler = function *(next) {
      if (this.req.method === 'POST') {
        this.status = 201
      } else if (this.req.method === 'DELETE') {
        this.status = 204
      } else {
        this.status = 200
      }

      spy(this.req.method)

      yield next
    }

    this.controller
    .override('get post put delete', handler)
    .register(this.server)

    // should exists custom handlers
    assert(this.controller._handlers)
    assert.equal(this.controller._handlers.post, handler)
    assert.equal(this.controller._handlers.put, handler)
    assert.equal(this.controller._handlers.get, handler)
    assert.equal(this.controller._handlers.delete, handler)

    yield request(this.server.listen())
      .post(this.controller._path)
      .expect(201)

    yield request(this.server.listen())
      .put(this.controller._path + '/1234')
      .expect(200)

    yield request(this.server.listen())
      .get(this.controller._path)
      .expect(200)

    yield request(this.server.listen())
      .delete(this.controller._path + '/1234')
      .expect(204)

    assert.equal(spy.callCount, 4)
    assert.equal(spy.args[0][0], 'POST')
    assert.equal(spy.args[1][0], 'PUT')
    assert.equal(spy.args[2][0], 'GET')
    assert.equal(spy.args[3][0], 'DELETE')
  })

  it('should fail when trying to replace a handler without generator', function (done) {
    try {
      this.controller.override('post', function () {})
      done('should have failed when trying to set a handler')
    } catch (e) {
      assert.equal(e.message, 'route handler requires be a generator function')
      done()
    }
  })
})
