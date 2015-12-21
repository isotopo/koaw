
'use strict'

const mongo = require('sails-mongo')
const Waterline = require('waterline')
const Stores = require('./collections/stores')

let orm = new Waterline()

// Load collections
orm.loadCollection(Stores)

let waterline = {
  orm: orm,
  options: {
    adapters: {
      default: mongo,
      mongo: mongo
    },
    connections: {
      'sails-mongo': {
        adapter: 'mongo',
        host: 'localhost',
        database: 'koa-restful'
      }
    }
  }
}

module.exports = waterline
