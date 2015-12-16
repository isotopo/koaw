'use strict'

const Validator = require('jsonschema').Validator

let validator = function *(body, schema, method) {
  let v = new Validator({ throwError: true })

  // Filter body by schema
  for (let prop in body) {
    if (!schema.hasOwnProperty(prop)) {
      delete body[prop]
    }
  }

  // Avoid to validate required params
  if (method === 'put') {
    for (let prop in schema) {
      if (!body.hasOwnProperty(prop)) {
        delete schema[prop]
      }
    }
  }

  let validate = v.validate(body, { properties: schema })

  if (validate.valid) {
    return body
  } else {
    throw new Error(validate.errors)
  }
}

module.exports = validator
