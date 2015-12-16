'use strict'

const Validator = require('jsonschema').Validator

let validator = function *(body, model, method) {
  let v = new Validator({throwError: true})
  let schema = { properties: {} }
  let mix = {}

  schema.properties = model

  if (method === 'put') {
    for (var propName in body) {
      if (typeof schema.properties[propName] !== 'undefined') {
        mix[propName] = schema.properties[propName]
      }
    }
  } else {
    mix = schema.properties
  }
  console.log(mix)
  console.log(body)
  let validate = v.validate(body, mix)
  if (validate.valid) {
    return mix
  } else {
    throw new Error(validate.errors)
  }
}

module.exports = validator
