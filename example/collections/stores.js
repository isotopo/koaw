'use strict'

const Waterline = require('waterline')

let Store = Waterline.Collection.extend({
  identity: 'store',
  connection: 'sails-mongo',
  attributes: {
    name: 'string',
    description: 'string'
  }
})

module.exports = Store
