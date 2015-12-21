'use strict'


const Koaw = require('koaw')
const waterline = require('./waterline')

let controller = new Koaw({
  orm: waterline.orm,
  model: 'store'
})

let handler = function *(next) {
  this.body = 'ok'
}

console.log(controller);
controller
  .methods('get')
  .override('get', handler)
module.exports = controller
