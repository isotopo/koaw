# Koawww

Create APIs using [Koa](http://koajs.com) and [Waterline](https://github.com/balderdashy/waterline). Koawww creates auto-generated CRUD routes, using the [co](https://github.com/tj/co) approach and the middleware design pattern.

## Install

With [npm](http://npmjs.org) do:

```
$ npm install koawww --save
```

## Usage

```js
const Controller = require('koawww')
const Store = require('./models/store')

// Set new controller
let controller = new Controller(model)

// Set methods to be used
controller.methods('get post put delete')

// Add middlewares to extend logic using generators
controller
  .before('post', function *(next) { /* some logic */ })
  .after('post', function *(next) { /* some logic */ })
  .before('post put', function *(next) { /* some logic */ })
  .after('post put', function *(next) { /* some logic */ })
  .after('put', function *(next) { /* some logic */ })

// Register server to generate routes
controller.register(server)
```

The above code registers the following routes:

```
POST /stores
GET /stores
GET /stores/:id
PUT /stores/:id
DELETE /stores/:id
```
