/* eslint-disable no-undef */
const assert = require('assert')
const rewire = require('rewire')
const server = rewire('../server')

const isPathMatch = server.__get__('isPathMatch')
const isMethodMatch = server.__get__('isMethodMatch')

describe('isPathMatch function', () => {
  it('path undefined case', () => {
    assert.strictEqual(isPathMatch(undefined, '/foo/bar'), false)
  });
  it('wildcard unused case - path match', () => {
    assert.strictEqual(isPathMatch('/foo/bar', '/foo/bar'), true)
  });
  it('wildcard unused case - path not match', () => {
    assert.strictEqual(isPathMatch('/foo/bar', '/foo/bar/baz'), false)
  });
  it('deep wildcard used case - path match', () => {
    assert.strictEqual(isPathMatch('/foo/**', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('**/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/**/baz', '/foo/bar1/bar2/baz'), true)
  });
  it('deep wildcard used case - path not match', () => {
    assert.strictEqual(isPathMatch('/bar/**', '/foo/bar/baz'), false)
    assert.strictEqual(isPathMatch('**/foo', '/foo/bar/baz'), false)
    assert.strictEqual(isPathMatch('/foo/**/baz', '/foo/bar1/bar2/bazz'), false)
    assert.strictEqual(isPathMatch('/foo/**/baz', '/fooo/bar1/bar2/baz'), false)
  });
  it('single wildcard used case - path match', () => {
    assert.strictEqual(isPathMatch('/foo/*', '/foo/bar'), true)
    assert.strictEqual(isPathMatch('/*/baz', '/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/*/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/ba*/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/bar*/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/b*r/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/*ar/baz', '/foo/bar/baz'), true)
    assert.strictEqual(isPathMatch('/foo/*bar/baz', '/foo/bar/baz'), true)
  });
  it('single wildcard used case - path not match', () => {
    assert.strictEqual(isPathMatch('/foo/*', '/foo/bar/baz'), false)
    assert.strictEqual(isPathMatch('/*/baz', '/foo/bar/baz'), false)
    assert.strictEqual(isPathMatch('/foo/*/baz', '/fooo/bar/baz'), false)
    assert.strictEqual(isPathMatch('/foo/ba*/baz', '/foo/bbar/baz'), false)

  });
});

describe('isMethodMatch function', () => {
  it('method undefined case', () => {
    assert.deepStrictEqual(isMethodMatch(undefined, 'GET'), false)
  });
  it('wildcard case', () => {
    assert.deepStrictEqual(isMethodMatch('*', 'GET'), true)
  });
  it('specify method case - request match', () => {
    assert.deepStrictEqual(isMethodMatch('get', 'GET'), true)
  });
  it('specify method case - request not match', () => {
    assert.deepStrictEqual(isMethodMatch('get', 'POST'), false)
  });
});