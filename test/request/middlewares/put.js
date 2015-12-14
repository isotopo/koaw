'use strict'

const assert = require('assert')
const Koaw = require('../../../lib')
const request = require('supertest')
const server = require('../../fixtures/server')
const sinon = require('sinon')
const waterline = require('../../fixtures/waterline')
const faker = require('faker')

describe('put middleware', function () {
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
      .methods('put')
      .before('put', function *(next) {
        spy('before.once')
        yield next
      })
      .before('put', function *(next) {
        spy('before.twice')
        yield next
      })
      .after('put', function *(next) {
        spy('after.once')
        yield next
      })
      .after('put', function *(next) {
        spy('after.twice')
        yield next
      })
      .register(this.server)

    // Create document
    yield request(this.server.listen()).put(controller._path + '/124').send({
      name: faker.lorem.words()[0],
      description: faker.lorem.paragraph()
    })

    assert.equal(spy.callCount, 4)
    assert.equal(spy.args[0][0], 'before.once')
    assert.equal(spy.args[1][0], 'before.twice')
    assert.equal(spy.args[2][0], 'after.once')
    assert.equal(spy.args[3][0], 'after.twice')
  })
})
