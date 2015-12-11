'use strict'

const assert = require('assert')
const inflect = require('i')()
const Router = require('koa-router')
const Waterline = require('waterline')

class Koaw {
  /**
   * Set config and instance properties.
   *
   * @param {Object} model - Model
   */
  constructor (options) {
    options = options || {}

    assert(options.orm, 'Controller needs a ORM to be initialized')
    assert(options.orm instanceof Waterline, 'Controller needs a Waterline ORM')
    assert(options.model, 'Controller needs a model to be initialized')

    // Set ORM instance
    this.orm = options.orm
    // Set model
    this.model = options.model
    // Set collection name pluralizing model
    this.collection = inflect.pluralize(options.model)
    // Set path
    this._path = `/${this.collection}`
    // Set valid methods
    this._methods = ['get', 'post', 'put', 'delete']
    // Set default methods
    this.allowedMethods = this._methods
    // Set router with prefix
    this.router = new Router({ prefix: this._path })
    // Set empty middlewares
    this._before = {}
    this._after = {}
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
      assert(validMethods, 'Controller only accepts valid methods')

      this.allowedMethods = methods
    }

    return this
  }

  validate () {}

  /**
   * Set a before middleware to HTTP method
   *
   * @param {String|Array} methods - HTTP methods (whitelisted if is a string)
   * @param {Function} handler - Middleware handler (a generator function)
   *
   * @return {Object} Instance
   */
  before (methods, handler) {
    return this._setMiddleware('before', methods, handler)
  }

  /**
   * Set an after middleware to HTTP method
   *
   * @param {String|Array} methods - HTTP methods (whitelisted if is a string)
   * @param {Function} handler - Middleware handler (a generator function)
   *
   * @return {Object} Instance
   */
  after (methods, handler) {
    return this._setMiddleware('after', methods, handler)
  }

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

    // Add routes to router
    this.allowedMethods.forEach(method => this[`_${method}`]())

    // Add created routes to server
    this._server
      .use(this.router.routes())
      .use(this.router.allowedMethods())

    return this
  }

  /**
   * Create a POST route to given model
   *
   */
  _post () {
    // Get model
    let model = this._getModel()

    // Create
    let create = function *() {
      this.body = yield model.create(this.request.body)
      this.status = 201
    }

    // Add route
    this.router.post('/', create)
  }

  /**
   * Create a GET routes to given model
   *
   */
  _get () {
    // Get model
    let model = this._getModel()

    // Collection
    let collection = function *() {
      this.body = yield model.find()
      this.status = 200
    }

    // Single
    let single = function *() {
      this.body = yield model.findOne({ id: this.params.id })
      this.status = 200
    }

    // Add routes
    this.router.get('/', collection)
    this.router.get('/:id', single)
  }

  /**
   * Create a PUT route to given model
   *
   */
  _put () {
    // Get model
    let model = this._getModel()

    // Update
    let update = function *() {
      let arr = yield model.update({ id: this.params.id }, this.request.body)
      this.body = arr[0]
    }

    // Add route
    this.router.put('/:id', update)
  }

  /**
   * Create a DELETE route to given model
   *
   */
  _delete () {
    // Get model
    let model = this._getModel()

    // Destroy
    let destroy = function *() {
      this.body = yield model.destroy({ id: this.params.id })
      this.status = 204
    }

    // Add route
    this.router.del('/:id', destroy)
  }

  /**
   * Add middlewares
   *
   * @param {String} type - Set type of middleware to add
   * @param {Array} methods - HTTP methods
   * @param {Function} handler -Handler to add as middleware
   */
  _setMiddleware (type, methods, handler) {
    if (!Array.isArray(methods)) {
      assert(typeof methods === 'string', 'HTTP methods should be specified with an array or whitelisted string')
      methods = this._setMiddleware(type, methods.split(' '), handler)
    } else {
      let validMethods = methods.every(m => !!~this._methods.indexOf(m))
      assert(validMethods, 'middleware only accepts valid methods')

      assert(handler, 'add a function to set a middleware')
      assert(handler && handler.constructor.name === 'GeneratorFunction', 'middleware handler requires be a generator function')

      methods.forEach(method => {
        this[`_${type}`][method] = this[`_${type}`][method] || []
        this[`_${type}`][method].push(handler)
      })
    }

    return this
  }

  /**
   * Get model from ORM
   *
   * @return {Object} - Model
   */
  _getModel () {
    assert(this.orm.collections, 'ORM should be initialized first...')
    assert(this.orm.collections[this.model], `model ${this.model} does not exists`)

    return this.orm.collections[this.model]
  }
}

module.exports = Koaw
