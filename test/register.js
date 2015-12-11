'use strict'

const assert = require('assert')
const Koaw = require('../lib')
const waterline = require('./fixtures/waterline')
const server = require('./fixtures/server')

describe('controller.register()', function () {
  before(function *() {
    this.server = yield server()
    this.waterline = yield waterline()
  })

  it('should return an instance to be chained', function () {
    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })

    assert.equal(controller, controller.register(this.server))
  })

  it('should fail when trying to register routes', function (done) {
    let controller = new Koaw({
      orm: this.waterline,
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
    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })
    controller.register(this.server)
    assert(controller._server)
  })

  it('should ensure to use a middleware server', function (done) {
    let controller = new Koaw({
      orm: this.waterline,
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
    this.waterline.teardown()
  })
})
