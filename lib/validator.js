'use strict'

const Validator = require('jsonschema').Validator

let validator = function *(body, model) {
  let v = new Validator({throwError: true})
  let schema = { properties: {} }
  let mix = {}

  schema.properties = model

  for (var propName in schema.properties) {
    if (typeof body[propName] !== 'undefined') {
      mix[propName] = body[propName]
    }
  }
  let validate = v.validate(mix, schema)
  if (validate.valid) {
    return mix
  } else {
    throw new Error(validate.errors)
  }
}

module.exports = validator
