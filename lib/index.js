'use strict'

const assert = require('assert')
const inflect = require('i')()
const route = require('koa-route')

class RestController {
  /**
   * Set config and instance properties.
   *
   * @param {Object} model - Model
   */
  constructor (model) {
    assert(model, 'Controller needs a model to be initialized')
    assert(model.identity, 'Model needs an identity property')

    this.model = model
    this.collectionName = inflect.pluralize(model.identity)
    this._path = `/${this.collectionName}`
    this._methods = ['get', 'post', 'put', 'delete']
    this.allowedMethods = this._methods
  }

  /**
   * Set specific HTTP methods.
   *
   * @param {String|Array} methods - HTTP methods (whitelisted if is a string)
   * @return {Object} - Instance
   */
  methods (methods) {
    if (!Array.isArray(methods)) {
      assert(typeof methods === 'string', 'HTTP methods should be specified with an array or whitelisted string')
      methods = this.methods(methods.split(' '))
    } else {
      let validMethods = methods.every(m => !!~this._methods.indexOf(m))
      assert(validMethods, 'Controller should only have valid methods')

      this.allowedMethods = methods
    }

    return this
  }

  validate () {}
  before () {}
  after () {}
  route () {}

  /**
   * Register routes to server
   *
   * @param {Object} - Server
   * @return {Object} - Instance
   */
  register (server) {
    assert(server, 'Controller needs a server to register routes')
    assert(typeof server.use === 'function', 'Controller needs a middleware server to register routes')

    // Set server private property
    this._server = server

    // Register routes by method
    this.allowedMethods.forEach(method => this[`_${method}`]())

    return this
  }

  /**
   * Create a POST route to given model
   *
   */
  _post () {
    let model = this.model

    let create = function *() {
      this.body = yield model.create(this.request.body)
      this.status = 201
    }

    this._server.use(route.post(this._path, create))
  }

  /**
   * Create a GET routes to given model
   *
   */
  _get () {}

  /**
   * Create a PUT route to given model
   *
   */
  _put () {}

  /**
   * Create a DELETE route to given model
   *
   */
  _delete () {}
}

module.exports = RestController
