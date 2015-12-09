'use strict'

const assert = require('assert')

class RestController {
  constructor (model) {
    assert(model, 'RestController needs a waterline model')

    this._model = model
  }

  methods () {}
  validate () {}
  before () {}
  after () {}
  route () {}
  register () {}
}

module.exports = RestController
