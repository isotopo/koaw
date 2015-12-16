'use strict'

const Validator = require('jsonschema').Validator

let validator = function *(body, schema, method) {
  let v = new Validator({ throwError: true })
  let params = Object.assign({}, body)

  // Filter body by schema
  for (let prop in params) {
    if (!schema.hasOwnProperty(prop)) {
      delete params[prop]
    }
  }

  // Avoid to validate required params
  if (method === 'put') {
    for (let prop in schema) {
      if (!params.hasOwnProperty(prop)) {
        delete schema[prop]
      }
    }
  }

  let validate = v.validate(params, { properties: schema })

  if (validate.valid) {
    return params
  } else {
    throw new Error(validate.errors)
  }
}

module.exports = validator
