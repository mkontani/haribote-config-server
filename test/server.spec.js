/* eslint-disable no-undef */
const path = require('path')
const assert = require('assert')
const sinon = require('sinon')
const Up = require('../server')
const rewire = require('rewire')
const server = rewire('../server')
const http = require('http')
const https = require('https')

const apply = server.__get__('apply')
const isPathMatch = server.__get__('isPathMatch')
const isMethodMatch = server.__get__('isMethodMatch')

describe('Up function', () => {
  it('http/https servers case', () => {
    const httpStub = sinon.stub(http)
    const httpsStub = sinon.stub(https)
    let httpPort, httpsPort
    httpStub.createServer.callsFake(() => {
      return {
        listen: function (port) {
          httpPort = port
        },
        on: function () { }
      }
    })
    httpsStub.createServer.callsFake(() => {
      return {
        listen: function (port) {
          httpsPort = port
        },
        on: function () { }
      }
    })

    Up([
      {
        name: 'http server',
        port: 9998
      },
      {
        name: 'https server',
        port: 9999,
        tls: {
          cert: path.join(process.cwd(), 'certs/server.crt'),
          key: path.join(process.cwd(), 'certs/server.key')
        }
      }
    ])

    assert.strictEqual(httpStub.createServer.calledOnce, true)
    assert.strictEqual(httpPort, 9998)
    assert.strictEqual(httpsStub.createServer.calledOnce, true)
    assert.strictEqual(httpsPort, 9999)
  })
})

describe('apply function', () => {
  const reqMock = {
    url: 'test.host/foo/bar',
    protocol: 'http',
    method: 'GET',
    dataCalled: false,
    endCalled: false,
    headers: {
      haribote_name: undefined,
      host: 'test.host'
    },
    on: function (event) {
      if (event === 'data') this.dataCalled = true
      if (event === 'end') this.endCalled = true
    }
  }
  const resMock = {
    statusCode: undefined,
    contentType: undefined,
    body: undefined,
    setHeader: function (_, v) {
      this.contentType = v
    },
    end: function (params) {
      this.body = params
    }
  }
  beforeEach(() => {
    reqMock.headers.haribote_name = undefined
    reqMock.dataCalled = false
    reqMock.endCalled = false
    resMock.statusCode = undefined
    resMock.contentType = undefined
    resMock.body = undefined
  })
  it('undefined mapping case', () => {
    apply(reqMock, resMock, { name: 'test', port: 9999 })
    assert.strictEqual(reqMock.dataCalled, true)
    assert.strictEqual(reqMock.endCalled, true)
    assert.strictEqual(resMock.statusCode, 200)
    assert.strictEqual(resMock.contentType, 'text/plain')
    assert.strictEqual(resMock.body, JSON.stringify(reqMock.headers))
  })
  it('undefined mapping case - defaultSettings', () => {
    apply(reqMock, resMock,
      {
        name: 'test',
        port: 9999,
        defaultStatusCode: 201,
        defaultContentType: 'application/json',
        defaultResBody: { res: 'ok' }
      })
    assert.strictEqual(reqMock.dataCalled, true)
    assert.strictEqual(reqMock.endCalled, true)
    assert.strictEqual(resMock.statusCode, 201)
    assert.strictEqual(resMock.contentType, 'application/json')
    assert.strictEqual(resMock.body, JSON.stringify({ res: 'ok' }))
  })
  it('has mapping, req priority case', () => {
    apply(reqMock, resMock,
      {
        name: 'test',
        port: 9999,
        mappings: [
          {
            priority: 1,
            req: {
              method: 'GET'
            },
            res: {
              contentType: 'notapply',
              statusCode: 201,
              body: 'aaa'
            }
          },
          {
            priority: 3,
            req: {
              method: 'GET'
            },
            res: {
              contentType: 'apply',
              statusCode: 202,
              body: 'bbb'
            }
          },
          {
            priority: 2,
            req: {
              method: 'GET'
            },
            res: {
              contentType: 'notapply',
              statusCode: 203,
              body: 'ccc'
            }
          },
          {
            req: {
              method: 'GET'
            },
            res: {
              contentType: 'undefpriority',
              statusCode: 203,
              body: 'ddd'
            }
          }
        ]
      })
    assert.strictEqual(reqMock.dataCalled, true)
    assert.strictEqual(reqMock.endCalled, true)
    assert.strictEqual(resMock.statusCode, 202)
    assert.strictEqual(resMock.contentType, 'apply')
    assert.strictEqual(resMock.body, '"bbb"')
  })
  it('has mapping, req undefined case', () => {
    apply(reqMock, resMock,
      {
        name: 'test',
        port: 9999,
        mappings: [
          {
            req: {
              method: 'POST'
            },
            res: {
              contentType: 'notapply',
              statusCode: 500,
              body: 'aaa'
            }
          }
        ]
      })
    assert.strictEqual(reqMock.dataCalled, true)
    assert.strictEqual(reqMock.endCalled, true)
    assert.strictEqual(resMock.statusCode, 200)
    assert.strictEqual(resMock.contentType, 'text/plain')
    assert.strictEqual(resMock.body, JSON.stringify(reqMock.headers))
  })
  it('undefined mapping, useLogging false case', () => {
    apply(reqMock, resMock, { name: 'test', port: 9999, useLogging: false })
    assert.strictEqual(reqMock.dataCalled, false)
    assert.strictEqual(reqMock.endCalled, false)
  })
  it('has mapping, useLogging false case', () => {
    apply(reqMock, resMock,
      {
        name: 'test',
        port: 9999,
        useLogging: false,
        mappings: [
          {
            req: {
              method: 'GET'
            },
            res: {
              statusCode: 200
            }
          }
        ]
      })
    assert.strictEqual(reqMock.dataCalled, false)
    assert.strictEqual(reqMock.endCalled, false)
  })
})

describe('isPathMatch function', () => {
  it('path undefined case', () => {
    assert.strictEqual(isPathMatch(undefined, '/foo/bar'), false)
  })
  it('wildcard unused case - path match', () => {
    assert.strictEqual(isPathMatch('/foo/bar', '/foo/bar'), true)
  })
  it('wildcard unused case - path not match', () => {
    assert.strictEqual(isPathMatch('/foo/bar', '/foo/bar/baz'), false)
  })
  it('deep wildcard used case - path match', () => {
    assert.strictEqual(isPathMatch('/foo/**', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('**/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/**/baz', '/foo/bar1/bar2/baz'), true)
  })
  it('deep wildcard used case - path not match', () => {
    assert.strictEqual(isPathMatch('/bar/**', '/foo/bar/baz'), false)
    assert.strictEqual(isPathMatch('**/foo', '/foo/bar/baz'), false)
    assert.strictEqual(isPathMatch('/foo/**/baz', '/foo/bar1/bar2/bazz'), false)
    assert.strictEqual(isPathMatch('/foo/**/baz', '/fooo/bar1/bar2/baz'), false)
  })
  it('single wildcard used case - path match', () => {
    assert.strictEqual(isPathMatch('/foo/*', '/foo/bar'), true)
    assert.strictEqual(isPathMatch('/*/baz', '/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/*/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/ba*/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/bar*/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/b*r/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/*ar/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/*bar/baz', '/foo/bar/baz'), true)
  })
  it('single wildcard used case - path not match', () => {
    assert.strictEqual(isPathMatch('/foo/*', '/foo/bar/baz'), false)
    assert.strictEqual(isPathMatch('/*/baz', '/foo/bar/baz'), false)
    assert.strictEqual(isPathMatch('/foo/*/baz', '/fooo/bar/baz'), false)
    assert.strictEqual(isPathMatch('/foo/ba*/baz', '/foo/bbar/baz'), false)
  })
})

describe('isMethodMatch function', () => {
  it('method undefined case', () => {
    assert.deepStrictEqual(isMethodMatch(undefined, 'GET'), false)
  })
  it('wildcard case', () => {
    assert.deepStrictEqual(isMethodMatch('*', 'GET'), true)
  })
  it('specify method case - request match', () => {
    assert.deepStrictEqual(isMethodMatch('get', 'GET'), true)
  })
  it('specify method case - request not match', () => {
    assert.deepStrictEqual(isMethodMatch('get', 'POST'), false)
  })
})
