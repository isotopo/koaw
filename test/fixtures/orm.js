'use strict'

const adapter = require('sails-mongo')
const Store = require('./store')
const Waterline = require('waterline')

let orm = new Waterline()
orm.loadCollection(Store)

// Initialize ORM to run unit tests
module.exports = function () {
  return new Promise(function (done, fail) {
    orm.initialize({
      adapters: {
        default: adapter,
        mongo: adapter
      },
      connections: {
        'sails-mongo': {
          adapter: 'mongo',
          host: 'localhost',
          database: 'koa-restful'
        }
      }
    }, function (err, models) {
      if (err) return fail(err)
      done(orm)
    })
  })
}
