'use strict'

const Waterline = require('waterline')

let Store = Waterline.Collection.extend({
  identity: 'store',
  connection: 'sails-mongo',
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    description: {
      type: 'string'
    }
  }
})

module.exports = Store
