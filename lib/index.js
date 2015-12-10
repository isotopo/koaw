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
  _get () {
    let model = this.model

    // Collection
    let collection = function *() {
      this.body = yield model.find()
      this.status = 200
    }

    // Single
    let single = function *(id) {
      this.body = yield model.findOne({ id: id })
      this.status = 200
    }

    // Add routes
    this._server.use(route.get(this._path, collection))
    this._server.use(route.get(`${this._path}/:id`, single))
  }

  /**
   * Create a PUT route to given model
   *
   */
  _put () {
    let model = this.model

    // Update
    let update = function *(id) {
      let arr = yield model.update({ id: id }, this.request.body)
      this.body = arr[0]
    }

    // Add route
    this._server.use(route.put(`${this._path}/:id`, update))
  }

  /**
   * Create a DELETE route to given model
   *
   */
  _delete () {
    let model = this.model

    // Destroy
    let destroy = function *(id) {
      this.body = yield model.destroy({ id: id })
      this.status = 204
    }

    // Add route
    this._server.use(route.delete(`${this._path}/:id`, destroy))
  }
}

module.exports = RestController
