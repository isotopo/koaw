'use strict'

const assert = require('assert')
const Waterline = require('waterline')
const RestController = require('../lib')
const Store = require('./fixtures/store')

describe('RestController#Constructor', function () {
  before(function () {
    // Get constructor methods
    let methods = Object.getOwnPropertyNames(RestController.prototype)
    // Filter public methods
    this.publicMethods = methods.filter(m => /^(?!_)(?!constructor)/.test(m))
  })

  it('should be a constructor', function () {
    let fn = RestController.toString()

    assert(/^class\s*/.test(fn))
    assert.equal(RestController.name, 'RestController')
  })

  it('should have only this set of public functions', function () {
    // Public functions that should have
    let fns = ['methods', 'validate', 'before', 'after', 'route', 'register']

    assert.equal(fns.length, this.publicMethods.length)

    for (let fn of fns) {
      assert.equal(typeof RestController.prototype[fn], 'function')
    }
  })
})

describe('RestController#Instance', function () {
  it('should fail when instantiating without model', function (done) {
    try {
      let controller = new RestController()
      done(controller)
    } catch (err) {
      assert.equal(err.message, 'RestController needs a waterline model')
      done()
    }
  })

  it('should initialize with this set of private properties', function () {
    let controller = new RestController(Store)
    assert(controller._model)
    assert(controller._model.prototype instanceof Waterline.Collection)
  })
})
