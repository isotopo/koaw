'use strict'

const assert = require('assert')
const Controller = require('../lib')
const Waterline = require('waterline')
const Store = require('./fixtures/store')

describe('controller#before|after', function () {
  before(function () {
    this.orm = new Waterline()
    this.orm.loadCollection(Store)
  })

  beforeEach(function () {
    this.controller = new Controller({
      orm: this.orm,
      model: 'store'
    })

    this.handler = function *(next) { yield next }
  })

  it('should set middleware using a whitelisted string', function () {
    this.controller.before('get post put', this.handler)
    this.controller.before('put delete', this.handler)
    this.controller.after('get post put', this.handler)
    this.controller.after('get post delete', this.handler)
    this.controller.after('delete', this.handler)

    assert(Array.isArray(this.controller._before.get))
    assert(Array.isArray(this.controller._before.post))
    assert(Array.isArray(this.controller._before.put))
    assert(Array.isArray(this.controller._before.delete))

    assert(Array.isArray(this.controller._after.get))
    assert(Array.isArray(this.controller._after.post))
    assert(Array.isArray(this.controller._after.put))
    assert(Array.isArray(this.controller._after.delete))

    assert.equal(this.controller._before.get.length, 1)
    assert.equal(this.controller._before.get[0], this.handler)
    assert.equal(this.controller._before.post.length, 1)
    assert.equal(this.controller._before.post[0], this.handler)
    assert.equal(this.controller._before.put.length, 2)
    assert.equal(this.controller._before.put[0], this.handler)
    assert.equal(this.controller._before.put[1], this.handler)
    assert.equal(this.controller._before.delete.length, 1)
    assert.equal(this.controller._before.delete[0], this.handler)

    assert.equal(this.controller._after.get.length, 2)
    assert.equal(this.controller._after.get[0], this.handler)
    assert.equal(this.controller._after.get[1], this.handler)
    assert.equal(this.controller._after.post.length, 2)
    assert.equal(this.controller._after.post[0], this.handler)
    assert.equal(this.controller._after.post[1], this.handler)
    assert.equal(this.controller._after.put.length, 1)
    assert.equal(this.controller._after.put[0], this.handler)
    assert.equal(this.controller._after.delete.length, 2)
    assert.equal(this.controller._after.delete[0], this.handler)
    assert.equal(this.controller._after.delete[1], this.handler)
  })

  it('should set middleware using an array', function () {
    this.controller.before(['post', 'delete'], this.handler)
    this.controller.after(['get', 'put', 'delete'], this.handler)

    assert(Array.isArray(this.controller._before.post))
    assert(Array.isArray(this.controller._before.delete))

    assert(Array.isArray(this.controller._after.get))
    assert(Array.isArray(this.controller._after.put))
    assert(Array.isArray(this.controller._after.delete))

    assert.equal(this.controller._before.post.length, 1)
    assert.equal(this.controller._before.post[0], this.handler)
    assert.equal(this.controller._before.delete.length, 1)
    assert.equal(this.controller._before.delete[0], this.handler)

    assert.equal(this.controller._after.get.length, 1)
    assert.equal(this.controller._after.get[0], this.handler)
    assert.equal(this.controller._after.put.length, 1)
    assert.equal(this.controller._after.put[0], this.handler)
    assert.equal(this.controller._after.delete.length, 1)
    assert.equal(this.controller._after.delete[0], this.handler)
  })

  it('should not set before middlewares with an invalid argument', function (done) {
    try {
      this.controller.before(function () {})
      done('should have failed with a invalid argument')
    } catch (e) {
      assert.equal(e.message, 'HTTP methods should be specified with an array or whitelisted string')
      done()
    }
  })

  it('should not set after middlewares with an invalid argument', function (done) {
    try {
      this.controller.after(function () {})
      done('should have failed with a invalid argument')
    } catch (e) {
      assert.equal(e.message, 'HTTP methods should be specified with an array or whitelisted string')
      done()
    }
  })

  it('should not set before middlewares with invalid methods', function (done) {
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

  it('should not set after middlewares with invalid methods', function (done) {
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
})
