'use strict'

const assert = require('assert')
const faker = require('faker')
const RestController = require('../lib')
const request = require('supertest')
const server = require('./fixtures/server')
const orm = require('./fixtures/orm')
const sinon = require('sinon')

describe('controller', function () {
  before(function *() {
    this.server = yield server()
    this.orm = yield orm()
    this.model = this.orm.collections.store
    this.agent = request(this.server.listen())
    this.spy = sinon.spy(this.server, 'use')
  })

  beforeEach(function () {
    this.spy.reset()
  })

  it('should fail when trying to register routes', function (done) {
    let controller = new RestController(this.model)
    try {
      controller.register()
      done('Should have failed when not specify a server')
    } catch (e) {
      assert.equal(e.message, 'Controller needs a server to register routes')
      done()
    }
  })

  it('should set a server property as private instance property', function () {
    let controller = new RestController(this.model)
    controller.register(this.server)
    assert(controller._server)
  })

  it('should ensure to use a middleware server', function (done) {
    let controller = new RestController(this.model)
    try {
      controller.register({ method: function () {} })
      done('Should have failed when is not a koa server')
    } catch (e) {
      assert.equal(e.message, 'Controller needs a middleware server to register routes')
      done()
    }
  })

  it('should set route through server.use method', function *() {
    let controller = new RestController(this.model)
    controller.methods('post')
    controller.register(this.server)
    assert.equal(this.spy.callCount, 1)
  })

  it('should set route to create a document', function *() {
    let controller = new RestController(this.model)
    controller.methods('post')
    controller.register(this.server)

    assert(this.spy.calledOnce)

    let params = {
      name: faker.lorem.words()[0],
      description: faker.lorem.paragraph()
    }

    let response = yield this.agent
      .post(`/${controller.collectionName}`)
      .send(params)

    this.id = response.body.id

    assert(response.body.id)
    assert.equal(response.body.name, params.name)
    assert.equal(response.body.description, params.description)
    assert.equal(response.statusCode, 201)

    let doc = yield controller.model.findOne({ id: this.id })
    assert.equal(params.name, doc.name)
    assert.equal(params.description, doc.description)
  })

  after(function () {
    this.orm.teardown()
  })
})
