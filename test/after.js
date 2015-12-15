'use strict'

const assert = require('assert')
const Koaw = require('../lib')
const waterline = require('./fixtures/waterline')

describe('controller.after()', function () {
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
    assert.equal(this.controller, this.controller.after('post', function *() {}))
  })

  it('should set middleware using a whitelisted string', function () {
    this.controller.after('get post put', this.handler)
    this.controller.after('get post delete', this.handler)
    this.controller.after('delete', this.handler)

    assert(Array.isArray(this.controller._after['/'].get))
    assert(Array.isArray(this.controller._after['/:id'].get))
    assert(Array.isArray(this.controller._after['/'].post))
    assert(Array.isArray(this.controller._after['/:id'].put))
    assert(Array.isArray(this.controller._after['/:id'].delete))

    assert.equal(this.controller._after['/'].get.length, 2)
    assert.equal(this.controller._after['/'].get[0], this.handler)
    assert.equal(this.controller._after['/'].get[1], this.handler)
    assert.equal(this.controller._after['/:id'].get.length, 2)
    assert.equal(this.controller._after['/:id'].get[0], this.handler)
    assert.equal(this.controller._after['/:id'].get[1], this.handler)
    assert.equal(this.controller._after['/'].post.length, 2)
    assert.equal(this.controller._after['/'].post[0], this.handler)
    assert.equal(this.controller._after['/'].post[1], this.handler)
    assert.equal(this.controller._after['/:id'].put.length, 1)
    assert.equal(this.controller._after['/:id'].put[0], this.handler)
    assert.equal(this.controller._after['/:id'].delete.length, 2)
    assert.equal(this.controller._after['/:id'].delete[0], this.handler)
    assert.equal(this.controller._after['/:id'].delete[1], this.handler)
  })

  it('should set middleware using an array', function () {
    this.controller.after(['get', 'put', 'delete'], this.handler)

    assert(Array.isArray(this.controller._after['/'].get))
    assert(Array.isArray(this.controller._after['/:id'].get))
    assert(Array.isArray(this.controller._after['/:id'].put))
    assert(Array.isArray(this.controller._after['/:id'].delete))

    assert.equal(this.controller._after['/'].get.length, 1)
    assert.equal(this.controller._after['/'].get[0], this.handler)
    assert.equal(this.controller._after['/:id'].get.length, 1)
    assert.equal(this.controller._after['/:id'].get[0], this.handler)
    assert.equal(this.controller._after['/:id'].put.length, 1)
    assert.equal(this.controller._after['/:id'].put[0], this.handler)
    assert.equal(this.controller._after['/:id'].delete.length, 1)
    assert.equal(this.controller._after['/:id'].delete[0], this.handler)
  })

  it('should not set middlewares with an invalid argument', function (done) {
    try {
      this.controller.after(function () {})
      done('should have failed with a invalid argument')
    } catch (e) {
      assert.equal(e.message, 'HTTP methods should be specified with an array or whitelisted string')
      done()
    }
  })

  it('should not set middlewares with invalid methods', function (done) {
    let strMethods = 'foo bar baz meh'

    try {
      this.controller.after(strMethods, this.handler)
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
      .after('post put', '/custom', this.handler)

    assert(Array.isArray(this.controller._after['/custom'].post))
    assert(Array.isArray(this.controller._after['/custom'].put))

    assert.equal(this.controller._after['/custom'].post.length, 1)
    assert.equal(this.controller._after['/custom'].post[0], this.handler)
    assert.equal(this.controller._after['/custom'].put.length, 1)
    assert.equal(this.controller._after['/custom'].put[0], this.handler)
  })
})
