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
  const defaultStatusCode = c.defaultStatusCode || 200
  const defaultContentType = c.defaultContentType || 'text/plain'
  const defaultResBody = JSON.stringify(c.defaultResBody) || c.defaultResBody || JSON.stringify(req.headers)

  const url = new URL(req.url, `${req.protocol}://${req.headers.host}`)

  // undefined mapping
  if (!c.mappings) {
    res.statusCode = defaultStatusCode
    res.setHeader('content-type', defaultContentType)
    res.end(defaultResBody)
    return
  } else {
    // check mappings
    let resContentType, resStatusCode, resBody
    let priority = -1
    c.mappings.forEach(m => {
      // method and path matched
      if ((m.req.path === url.pathname &&
        m.req.method && m.req.method.toUpperCase() === req.method) ||
        // path matched and method undefined
        (!m.req.method && m.req.path === url.pathname) ||
        // method matched and path undefined
        (m.req.method && m.req.method.toUpperCase() === req.method && !m.req.path)) {
        if (!m.priority || m.priority > priority) {
          priority = m.priority
          resContentType = m.res.contentType
          resStatusCode = m.res.statusCode
          resBody = m.res.body
        }
      }
    })
    if (resContentType || resStatusCode || resBody) {
      res.setHeader('content-type', resContentType || defaultContentType)
      res.statusCode = resStatusCode || defaultStatusCode
      res.end(JSON.stringify(resBody) || defaultResBody)
      return
    }
  }
  // has mapping, but undefined case
  res.statusCode = defaultStatusCode
  res.setHeader('content-type', defaultContentType)
  res.end(defaultResBody)
}

module.exports = Up
