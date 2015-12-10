'use strict'

const assert = require('assert')
const inflect = require('i')()
const koa = require('koa')
const orm = require('./fixtures/orm')
const RestController = require('../lib')
const Waterline = require('waterline')

describe('RestController#Constructor', function () {
  before(function () {
    // Get constructor methods
    let methods = Object.getOwnPropertyNames(RestController.prototype)
    // Filter public methods
    this.publicMethods = methods.filter(m => /^(?!_)(?!constructor)/.test(m))
    // Filter private methods
    this.privateMethods = methods.filter(f => /^_/.test(f))
  })

  it('should be a constructor', function () {
    let fn = RestController.toString()

    assert(/^class\s*/.test(fn))
    assert.equal(RestController.name, 'RestController')
  })

  it('should have only this set of public methods', function () {
    let fns = ['methods', 'validate', 'before', 'after', 'route', 'register']

    assert.equal(fns.length, this.publicMethods.length)

    for (let fn of fns) {
      assert.equal(typeof RestController.prototype[fn], 'function')
    }
  })

  it('should have only this set of private methods', function () {
    let fns = ['_get', '_post', '_put', '_delete']

    assert.equal(fns.length, this.privateMethods.length)

    for (let fn of fns) {
      assert.equal(typeof RestController.prototype[fn], 'function')
    }
  })
})

describe('RestController#Instance', function () {
  before(function *() {
    this.orm = yield orm()
    this.model = this.orm.collections.store
  })

  it('should fail when instantiating without model', function (done) {
    try {
      let controller = new RestController()
      done(controller)
    } catch (err) {
      assert.equal(err.message, 'Controller needs a model to be initialized')
      done()
    }
  })

  it('should initialize with this set of properties', function () {
    let controller = new RestController(this.model)
    let collectionName = inflect.pluralize(this.model.identity)
    assert(controller._methods)
    assert(controller._path, `/${collectionName}`)
    assert(controller.model)
    assert(controller.model instanceof Waterline.Collection)
    assert(controller.allowedMethods)
    assert.equal(controller._methods, controller.allowedMethods)
    assert.equal(controller.collectionName, collectionName)
  })

  it('should be chained in all methods', function () {
    let server = koa()
    let controller = new RestController(this.model)
    assert.equal(controller, controller.methods('get post'))
    assert.equal(controller, controller.register(server))
  })

  after(function () {
    this.orm.teardown()
  })
})
