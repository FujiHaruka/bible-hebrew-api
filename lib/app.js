const {APP_PORT, URL_PREFIX} = require('../env')
const Koa = require('koa')
const logger = require('koa-logger')
const router = require('koa-router')({ prefix: URL_PREFIX })
const cors = require('@koa/cors')
const route = require('./route')
const app = module.exports = new Koa()

route(router)

app.use(cors())
app.use(router.routes())
app.use(router.allowedMethods())

if (!module.parent) {
  app.use(logger())
  app.listen(APP_PORT)
  console.log(`Server listening on port ${APP_PORT}`)
}
