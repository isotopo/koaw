'use strict'

const assert = require('assert')
const inflect = require('i')()
const Router = require('koa-router')
const waterline = require('./fixtures/waterline')
const Koaw = require('../lib')
const Waterline = require('waterline')

describe('Koaw', function () {
  before(function () {
    // Get constructor methods
    let methods = Object.getOwnPropertyNames(Koaw.prototype)
    // Filter public methods
    this.publicMethods = methods.filter(m => /^(?!_)(?!constructor)/.test(m))
    // Filter private methods
    this.privateMethods = methods.filter(f => /^_/.test(f))
  })

  it('should be a constructor', function () {
    let fn = Koaw.toString()

    assert(/^class\s*/.test(fn))
    assert.equal(Koaw.name, 'Koaw')
  })

  it('should have only this set of public methods', function () {
    let fns = ['methods', 'override', 'before', 'after', 'route', 'register']

    assert.equal(fns.length, this.publicMethods.length)

    for (let fn of fns) {
      assert.equal(typeof Koaw.prototype[fn], 'function')
    }
  })

  it('should have only this set of private methods', function () {
    let fns = [
      '_get',
      '_post',
      '_put',
      '_delete',
      '_route',
      '_getModel',
      '_setMiddleware'
    ]

    assert.equal(fns.length, this.privateMethods.length)

    for (let fn of fns) {
      assert.equal(typeof Koaw.prototype[fn], 'function')
    }
  })
})

describe('controller', function () {
  before(function *() {
    this.waterline = yield waterline()
  })

  after(function () {
    this.waterline.teardown()
  })

  it('should fail when instantiating without ORM instance', function (done) {
    try {
      let controller = new Koaw()
      done('Should have failed when missing a ORM instance', controller)
    } catch (err) {
      assert.equal(err.message, 'Controller needs a ORM to be initialized')
      done()
    }
  })

  it('should fail when instantiating without model', function (done) {
    try {
      let controller = new Koaw({
        orm: this.waterline
      })
      done('Should have failed when missing a model', controller)
    } catch (err) {
      assert.equal(err.message, 'Controller needs a model to be initialized')
      done()
    }
  })

  it('should fail when instantiating with a ORM invalid', function (done) {
    try {
      let controller = new Koaw({
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
    let controller = new Koaw({
      orm: this.waterline,
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
    assert(controller._handlers)
  })
})
