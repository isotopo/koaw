'use strict'

const Koa = require('koa')
const waterline = require('./waterline')
const controller = require('./index')

let server = new Koa()

waterline.orm.initialize(waterline.options, function (err, models) {
  server.listen(4000)
  controller.register(server)
  console.log('Listening at 4000')
})
