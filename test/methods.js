'use strict'

const assert = require('assert')
const RestController = require('../lib')
const Store = require('./fixtures/store')

describe('controller', function () {
  it('should set default methods', function () {
    let methods = ['GET', 'POST', 'PUT', 'DELETE']
    let controller = new RestController(Store)
    assert(Array.isArray(controller._methods))
    assert.equal(controller._methods.length, methods.length)

    methods.forEach(function (method) {
      assert(controller._methods.indexOf(method) > -1)
    })
  })

  it('should set specific methods', function () {
    let methods = ['GET', 'POST']
    let controller = new RestController(Store)
    controller.methods(methods.join(' '))

    assert(Array.isArray(controller._methods))
    assert.equal(controller._methods.length, methods.length)
    methods.forEach(function (method) {
      assert(controller._methods.indexOf(method) > -1)
    })
  })

  it('should set specific methods with an array', function () {
    let methods = ['PUT', 'DELETE']
    let controller = new RestController(Store)
    controller.methods(methods)

    assert(Array.isArray(controller._methods))
    assert.equal(controller._methods.length, methods.length)
    methods.forEach(function (method) {
      assert(controller._methods.indexOf(method) > -1)
    })
  })

  it('should not set specific methods with an invalid argument', function (done) {
    let controller = new RestController(Store)

    try {
      controller.methods(function () {})
      done(controller)
    } catch (e) {
      assert.equal(e.message, 'HTTP methods should be specified only as string or array')
      done()
    }
  })

  it('should not set invalid methods', function (done) {
    let controller = new RestController(Store)
    let strMethods = 'FOO BAR BAZ MEH'

    try {
      // should throw an error
      controller.methods(strMethods)
      done(controller)
    } catch (e) {
      let methods = ['GET', 'POST', 'PUT', 'DELETE']

      assert.equal(controller._methods.length, methods.length)
      methods.forEach(function (method) {
        assert(controller._methods.indexOf(method) > -1)
      })

      done()
    }
  })
})
