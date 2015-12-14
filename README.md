# Koaw [![Build Status](https://travis-ci.org/4yopping/koaw.svg?branch=master)](https://travis-ci.org/4yopping/koaw)

Create APIs using [Koa](http://koajs.com) and [Waterline](https://github.com/balderdashy/waterline). Koaw creates auto-generated CRUD routes, using the [co](https://github.com/tj/co) approach and the middleware design pattern.

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
let controller = new Koaw({
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

## API

### .methods(methods)

Change default methods with an array or whitelisted string. These are default methods: `post` `put` `get` `delete`.

### .override(methods, handler)

Change default handler of auto-generated routes. The methods should be specified with an array or whitelisted string.

### .route(methods, path, fn)

Add custom route to given model. The methods should be specified with an array or whitelisted string. For instance, `.route('get', 'custom', fn)` should generate this route: `GET /[collection]/custom`

### .before(methods, fn)

Add a before middleware to one or more methods. The methods should be specified with an array or whitelisted string.

### .after(methods, fn)

Add an after middleware to one or more methods. The methods should be specified with an array or whitelisted string.

### .register(server)

Register controller routes to server. `.register` must be called at the end of above methods.


## Contribute

### Todos

* Add middleware support to custom routes
* Add support to queries, filters and populating

## License

MIT
