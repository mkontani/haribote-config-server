'use strict'

const http = require('http')
const https = require('https')
const fs = require('fs')

const Up = (config) => {
  config.forEach(c => {
    let server
    if (c.tls) {
      server = https.createServer({
        key: fs.readFileSync(c.tls.key),
        cert: fs.readFileSync(c.tls.cert)
      }, (req, res) => {
        req.protocol = 'https'
        apply(req, res, c)
      })
    } else {
      server = http.createServer((req, res) => {
        req.protocol = 'http'
        apply(req, res, c)
      })
    }
    server.listen(c.port, () => {
      const schema = c.tls ? 'HTTPS' : 'HTTP'
      console.log(`${schema} Server ${c.name} is listening on PORT ${c.port}`)
    })

    server.on('error', (e) => {
      console.log(e)
      process.exit(1)
    })
  })
}

const apply = (req, res, c) => {
  // default settings
  req.headers.haribote_name = c.name || 'haribote-server'
  const resBody = JSON.stringify(req.headers, null, 2)

  const url = new URL(req.url, `${req.protocol}://${req.headers.host}`)

  // undefined mapping
  if (!c.mappings) {
    res.statusCode = 200
    res.end(resBody)
    return
  } else {
    // check mappings
    let resContentType, resStatusCode, resBody
    c.mappings.forEach(m => {
      // method and path matched
      if ((m.req.path === url.pathname &&
        m.req.method && m.req.method.toUpperCase() === req.method) ||
        // path matched and method undefined
        (!m.req.method && m.req.path === url.pathname) ||
        // method matched and path undefined
        (m.req.method && m.req.method.toUpperCase() === req.method && !m.req.path)) {
        resContentType = m.res.contentType
        resStatusCode = m.res.statusCode
        resBody = m.res.body
      }
    })
    if (resContentType || resStatusCode || resBody) {
      res.setHeader('content-type', resContentType || 'plain/text')
      res.statusCode = resStatusCode || 200
      res.end(JSON.stringify(resBody) || resBody)
      return
    }
  }
  // has mapping, but undefined case
  res.statusCode = 404
  res.end(resBody)
}

module.exports = Up
