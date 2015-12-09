'use strict'

const assert = require('assert')

class RestController {
  /**
   * Set config and instance properties.
   *
   * @param {Object} model - Model
   */
  constructor (model) {
    assert(model, 'Controller needs a model to be initialized')

    this._model = model
    this._defaultMethods = ['GET', 'POST', 'PUT', 'DELETE']
    this._methods = this._defaultMethods
  }

  /**
   * Set specific HTTP methods.
   *
   * @param {String|Array} methods - HTTP methods (separared by whitespace if is string)
   *
   * @return {Object} - Instance
   */
  methods (methods) {
    if (!Array.isArray(methods)) {
      assert(typeof methods === 'string', 'HTTP methods should be specified only as string or array')
      methods = this.methods(methods.split(' '))
    } else {
      methods.map((method) =>
        assert(this._defaultMethods.indexOf(method) > -1, 'Controller should only have valid methods'))

      this._methods = methods
    }

    return this
  }

  validate () {}
  before () {}
  after () {}
  route () {}
  register () {}
}

module.exports = RestController
