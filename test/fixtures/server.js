'use strict'

const bodyParser = require('koa-bodyparser')
const koa = require('koa')

module.exports = function () {
  return new Promise(function (done) {
    let server = koa()
    server.use(bodyParser())

    done(server)
  })
}
