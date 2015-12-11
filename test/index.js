'use strict'

const assert = require('assert')
const inflect = require('i')()
const koa = require('koa')
const Router = require('koa-router')
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
    let fns = ['_get', '_post', '_put', '_delete', '_getModel', '_setMiddleware']

    assert.equal(fns.length, this.privateMethods.length)

    for (let fn of fns) {
      assert.equal(typeof RestController.prototype[fn], 'function')
    }
  })
})

describe('RestController#Instance', function () {
  before(function *() {
    this.orm = yield orm()
  })

  it('should fail when instantiating without ORM instance', function (done) {
    try {
      let controller = new RestController()
      done('Should have failed when missing a ORM instance', controller)
    } catch (err) {
      assert.equal(err.message, 'Controller needs a ORM to be initialized')
      done()
    }
  })

  it('should fail when instantiating without model', function (done) {
    try {
      let controller = new RestController({
        orm: this.orm
      })
      done('Should have failed when missing a model', controller)
    } catch (err) {
      assert.equal(err.message, 'Controller needs a model to be initialized')
      done()
    }
  })

  it('should fail when instantiating with a ORM invalid', function (done) {
    try {
      let controller = new RestController({
        orm: {},
        model: 'store'
      })
      done('Should have failed when adding a ORM invalid', controller)
    } catch (err) {
      assert.equal(err.message, 'Controller needs a Waterline ORM')
      done()
    }
  })

  it('should initialize with this set of properties', function () {
    let controller = new RestController({
      orm: this.orm,
      model: 'store'
    })

    let collection = inflect.pluralize(controller.model)
    assert(controller.model)
    assert(controller.orm)
    assert(controller.orm instanceof Waterline)
    assert(controller._methods)
    assert(controller.router instanceof Router)
    assert(controller._path, `/${collection}`)
    assert(controller.allowedMethods)
    assert.equal(controller._methods, controller.allowedMethods)
    assert.equal(controller.collection, collection)
    assert(controller._before)
    assert(controller._after)
  })

  it('should be chained in all methods', function () {
    let server = koa()
    let controller = new RestController({
      orm: this.orm,
      model: 'store'
    })
    assert.equal(controller, controller.methods('get post'))
    assert.equal(controller, controller.register(server))
    assert.equal(controller, controller.before('post', function *() {}))
  })

  after(function () {
    this.orm.teardown()
  })
})
