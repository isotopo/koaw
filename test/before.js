'use strict'

const assert = require('assert')
const Koaw = require('../lib')
const waterline = require('./fixtures/waterline')

describe('controller.before()', function () {
  before(function *() {
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

    this.handler = function *(next) { yield next }
  })

  it('should return an instance to be chained', function () {
    assert.equal(this.controller, this.controller.before('get', function *() {}))
  })

  it('should set middleware using a whitelisted string', function () {
    this.controller.before('get post put', this.handler)
    this.controller.before('put delete', this.handler)

    assert(Array.isArray(this.controller._before['/'].get))
    assert(Array.isArray(this.controller._before['/:id'].get))
    assert(Array.isArray(this.controller._before['/'].post))
    assert(Array.isArray(this.controller._before['/:id'].put))
    assert(Array.isArray(this.controller._before['/:id'].delete))

    assert.equal(this.controller._before['/'].get.length, 1)
    assert.equal(this.controller._before['/'].get[0], this.handler)
    assert.equal(this.controller._before['/:id'].get.length, 1)
    assert.equal(this.controller._before['/:id'].get[0], this.handler)
    assert.equal(this.controller._before['/'].post.length, 1)
    assert.equal(this.controller._before['/'].post[0], this.handler)
    assert.equal(this.controller._before['/:id'].put.length, 2)
    assert.equal(this.controller._before['/:id'].put[0], this.handler)
    assert.equal(this.controller._before['/:id'].delete.length, 1)
    assert.equal(this.controller._before['/:id'].delete[0], this.handler)
  })

  it('should set middleware using an array', function () {
    this.controller.before(['post', 'delete'], this.handler)

    assert(Array.isArray(this.controller._before['/'].post))
    assert(Array.isArray(this.controller._before['/:id'].delete))

    assert.equal(this.controller._before['/'].post.length, 1)
    assert.equal(this.controller._before['/'].post[0], this.handler)
    assert.equal(this.controller._before['/:id'].delete.length, 1)
    assert.equal(this.controller._before['/:id'].delete[0], this.handler)
  })

  it('should not set middlewares with an invalid argument', function (done) {
    try {
      this.controller.before(function () {})
      done('should have failed with a invalid argument')
    } catch (e) {
      assert.equal(e.message, 'HTTP methods should be specified with an array or whitelisted string')
      done()
    }
  })

  it('should not set middlewares with invalid methods', function (done) {
    let strMethods = 'foo bar baz meh'

    try {
      this.controller.before(strMethods, this.handler)
      done('should have failed when trying to create middlewares with invalid methods')
    } catch (e) {
      let methods = this.controller._methods
      let allowed = this.controller.allowedMethods

      assert(Array.isArray(allowed))
      assert.equal(allowed.length, methods.length)
      assert(allowed.every(m => !!~methods.indexOf(m)))

      done()
    }
  })

  it('should set a middleware to custom route', function () {
    this.controller
      .route('post put', '/custom', function *() {})
      .before('post put', '/custom', this.handler)

    assert(Array.isArray(this.controller._before['/custom'].post))
    assert(Array.isArray(this.controller._before['/custom'].put))

    assert.equal(this.controller._before['/custom'].post.length, 1)
    assert.equal(this.controller._before['/custom'].post[0], this.handler)
    assert.equal(this.controller._before['/custom'].put.length, 1)
    assert.equal(this.controller._before['/custom'].put[0], this.handler)
  })
})
