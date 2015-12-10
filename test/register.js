'use strict'

const assert = require('assert')
const RestController = require('../lib')
const orm = require('./fixtures/orm')
const server = require('./fixtures/server')

describe('controller#register', function () {
  before(function *() {
    this.server = yield server()
    this.orm = yield orm()
  })

  it('should fail when trying to register routes', function (done) {
    let controller = new RestController({
      orm: this.orm,
      model: 'store'
    })
    try {
      controller.register()
      done('Should have failed when not specify a server')
    } catch (e) {
      assert.equal(e.message, 'Controller needs a server to register routes')
      done()
    }
  })

  it('should set a server property as private instance property', function () {
    let controller = new RestController({
      orm: this.orm,
      model: 'store'
    })
    controller.register(this.server)
    assert(controller._server)
  })

  it('should ensure to use a middleware server', function (done) {
    let controller = new RestController({
      orm: this.orm,
      model: 'store'
    })
    try {
      controller.register({ method: function () {} })
      done('Should have failed when is not a koa server')
    } catch (e) {
      assert.equal(e.message, 'Controller needs a middleware server to register routes')
      done()
    }
  })

  after(function () {
    this.orm.teardown()
  })
})
