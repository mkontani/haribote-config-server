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
  const defaultResHeaders = c.defaultResHeaders || {}
  const defaultContentType = c.defaultContentType || 'text/plain'
  const defaultResBody = JSON.stringify(c.defaultResBody) || c.defaultResBody || JSON.stringify(req.headers)

  const url = new URL(req.url, `${req.protocol}://${req.headers.host}`)

  if (c.mappings) {
    // check mappings
    let resContentType, resStatusCode, resHeaders, resBody
    let priority = -1
    c.mappings.forEach(m => {
      // method and path matched
      if ((isPathMatch(m.req.path, url.pathname) && isMethodMatch(m.req.method, req.method)) ||
        // path matched and method undefined
        (!m.req.method && isPathMatch(m.req.path, url.pathname)) ||
        // method matched and path undefined
        (isMethodMatch(m.req.method, req.method) && !m.req.path)) {
        if (!m.priority) m.priority = 0
        if (m.priority > priority) {
          resContentType = m.res.contentType
          resStatusCode = m.res.statusCode
          resHeaders = m.res.headers
          resBody = m.res.body
          priority = m.priority
        }
      }
    })
    if (resContentType || resStatusCode || resHeaders || resBody) {
      res.setHeader('content-type', resContentType || defaultContentType)
      res.statusCode = resStatusCode || defaultStatusCode
      setResHeaders(res, resHeaders || defaultResHeaders)
      res.end(JSON.stringify(resBody) || defaultResBody)
      return
    }
  }
  // mapping undefined case
  res.statusCode = defaultStatusCode
  res.setHeader('content-type', defaultContentType)
  setResHeaders(res, defaultResHeaders)
  res.end(defaultResBody)
}

const setResHeaders = (res, h) => {
  Object.keys(h).forEach(k => res.setHeader(k, h[k]))
}

const isPathMatch = (m, r) => {
  // path undefined
  if (!m) return false
  // if wildcard not used, exactly match
  else if (m.indexOf('*') === -1) return m === r
  // if deep wildcard used, check with full path
  else if (m.indexOf('**') > -1) {
    const mm = m.split('**')
    return r.startsWith(mm[0]) && r.endsWith(mm[1])
  } else {
    // if single wildcard used, check with per layer
    const ms = m.split('/'); const rs = r.split('/')
    if (ms.length !== rs.length) return false
    let idx = -1
    return rs.every(rso => {
      idx++ // 0,1,...
      if (ms[idx].indexOf('*') === -1) return ms[idx] === rso
      const msm = ms[idx].split('*')
      return rso.startsWith(msm[0]) && rso.endsWith(msm[1])
    })
  }
}

const isMethodMatch = (m, r) => {
  if (!m) return false // method undefined
  return m === '*' || m.toUpperCase() === r
}

module.exports = Up
