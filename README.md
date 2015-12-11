# koaw

Create APIs using [Koa](http://koajs.com) and [Waterline](https://github.com/balderdashy/waterline). koaw creates auto-generated CRUD routes, using the [co](https://github.com/tj/co) approach and the middleware design pattern.

## Install

With [npm](http://npmjs.org) do:

```
$ npm install koaw --save
```

## Usage

```js
const Koa = require('koa')
const Koaw = require('koaw')
const Waterline = require('waterline')
const Stores = require('./collections/stores')

// Set collections to ORM
let waterline = new Waterline()
waterline.loadCollection(Stores)

// Create server
let server = new Koa()

// Set new controller
let controller = new Controller({
  orm: waterline,
  model: 'store'
})

controller
  // Set methods to be used
  .methods('get post put delete')
  // Add middlewares to extend logic using generators
  .before('post', function *(next) { /* some logic */ yield next })
  .after('post', function *(next) { /* some logic */ yield next })
  .before('post put', function *(next) { /* some logic */ yield next })
  .after('post put', function *(next) { /* some logic */ yield next })
  .after('put', function *(next) { /* some logic */ yield next })
  // Register controller
  .register(server)

waterline.initialize({}, function (err) {
  server.listen(4000)
})
```

The above code registers the following routes:

```
POST /stores
GET /stores
GET /stores/:id
PUT /stores/:id
DELETE /stores/:id
```

## Todo

* Create a `koaw.validate` method to validate params
* Add middleware support to custom routes
* Create a `koaw.override` method to replace default handlers
