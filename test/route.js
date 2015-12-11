'use strict'

const assert = require('assert')
const Koaw = require('../lib')
const server = require('./fixtures/server')
const request = require('supertest')
const waterline = require('./fixtures/waterline')

describe('controller.route()', function () {
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

    this.handler = function *() {
      if (this.req.method === 'POST') {
        this.status = 201
      } else {
        this.status = 200
      }
    }
  })

  it('should return an instance to be chained', function () {
    let path = 'custom'
    let handler = function *(next) { yield next }

    assert.equal(this.controller, this.controller.route('post', path, handler))
  })

  it('should set with whitelisted methods', function *() {
    this.controller.route('post get', 'custom', this.handler)
    this.controller.register(this.server)

    yield request(this.server.listen())
      .post(`/${this.controller.collection}/custom`)
      .expect(201)

    yield request(this.server.listen())
      .get(`/${this.controller.collection}/custom`)
      .expect(200)
  })

  it('should set with an array', function *() {
    this.controller.route(['put', 'get'], 'another', this.handler)
    this.controller.register(this.server)

    yield request(this.server.listen())
      .put(`/${this.controller.collection}/another`)
      .expect(200)

    yield request(this.server.listen())
      .get(`/${this.controller.collection}/another`)
      .expect(200)
  })

  it('should fail when trying to register a route with invalid methods', function (done) {
    try {
      this.controller.route('foo bar meh baz', 'custom')
      done('should have failed with invalid methods')
    } catch (e) {
      assert.equal(e.message, 'route only accepts valid methods')
      done()
    }
  })

  it('should fail when trying to register a route without params', function (done) {
    try {
      this.controller.route()
      done('should have failed without params')
    } catch (e) {
      assert.equal(e.message, 'HTTP methods should be specified with an array or whitelisted string')
      done()
    }
  })

  it('should fail when trying to register a route without a path', function (done) {
    try {
      this.controller.route(['put', 'get'])
      done('should have failed without path')
    } catch (e) {
      assert.equal(e.message, 'route needs a path to be created')
      done()
    }
  })

  it('should fail when trying to register a route with invalid path', function (done) {
    try {
      this.controller.route(['put', 'get'], function *() {})
      done('should have failed with invalid path')
    } catch (e) {
      assert.equal(e.message, 'route needs a path string')
      done()
    }
  })

  it('should fail when trying to register a route without a handler', function (done) {
    try {
      this.controller.route(['put', 'get'], 'custom')
      done('should have failed without handler')
    } catch (e) {
      assert.equal(e.message, 'route needs a handler to be created')
      done()
    }
  })

  it('should fail when trying to register a route with invalid function', function (done) {
    try {
      this.controller.route(['put', 'get'], 'custom', function () {})
      done('should have failed with an invalid function')
    } catch (e) {
      assert.equal(e.message, 'route handler requires be a generator function')
      done()
    }
  })
})
