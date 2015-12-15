'use strict'

const assert = require('assert')
const Koaw = require('../../../lib')
const request = require('supertest')
const server = require('../../fixtures/server')
const sinon = require('sinon')
const waterline = require('../../fixtures/waterline')
const faker = require('faker')

describe('post middleware', function () {
  before(function *() {
    this.server = yield server()
    this.waterline = yield waterline()
  })

  after(function () {
    this.waterline.teardown()
  })

  it('should be executed before and after of main handler', function *() {
    let spy = sinon.spy()

    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })

    controller
      .methods('post')
      .before('post', function *(next) {
        spy('before.once')
        yield next
      })
      .before('post', function *(next) {
        spy('before.twice')
        yield next
      })
      .after('post', function *(next) {
        spy('after.once')
        yield next
      })
      .after('post', function *(next) {
        spy('after.twice')
        yield next
      })
      .register(this.server)

    // Create document
    yield request(this.server.listen()).post(controller._path).send({
      name: faker.lorem.words()[0],
      description: faker.lorem.paragraph()
    })

    assert.equal(spy.callCount, 4)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'after.once')
    assert.equal(spy.args[3][0], 'after.twice')
  })

  it('should have validator middleware', function *() {
    let spy = sinon.spy()

    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })

    .methods('post')
    .before('post', function *(next) {
      spy(this.modelParams)
      yield next
    })
    .register(this.server)

    yield request(this.server.listen()).post(controller._path).send({
      name: faker.lorem.words()[0],
      description: faker.lorem.paragraph(),
      active: true
    }).expect(201)

    assert.equal(2, Object.keys(spy.args[0][0]).length)
  })

  it('should reject if properties are incorrect', function *() {
    let spy = sinon.spy()

    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })

    .methods('post')
    .before('post', function *(next) {
      spy(this.modelParams)
      yield next
    })
    .register(this.server)

    yield request(this.server.listen()).post(controller._path).send({
      name: 1,
      description: faker.lorem.paragraph(),
      active: true
    }).expect(500)
  })

  it('should be executed before and after of custom route', function *() {
    let spy = sinon.spy()

    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })

    controller
      .route('post', '/custom', function *(next) {
        spy('handler')
        this.status = 201
        yield next
      })
      .before('post', '/custom', function *(next) {
        spy('before.once')
        yield next
      })
      .before('post', '/custom', function *(next) {
        spy('before.twice')
        yield next
      })
      .after('post', '/custom', function *(next) {
        spy('after.once')
        yield next
      })
      .after('post', '/custom', function *(next) {
        spy('after.twice')
        yield next
      })
      .register(this.server)

    // Request
    yield request(this.server.listen())
      .post(`${controller._path}/custom`)
      .expect(201)

    assert.equal(spy.callCount, 5)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'handler')
    assert.equal(spy.args[3][0], 'after.once')
    assert.equal(spy.args[4][0], 'after.twice')
  })

  it('should not reject by validator when is a custom route', function *() {
    let controller = new Koaw({
      orm: this.waterline,
      model: 'store'
    })

    .route('post', '/custom', function *(next) {
      this.status = 201
      yield next
    })
    .register(this.server)

    yield request(this.server.listen())
      .post(`${controller._path}/custom`)
      .send({
        name: 1,
        description: faker.lorem.paragraph(),
        active: true
      })
      .expect(201)
  })
})
