/* eslint-env jest */

const { isSocial, normalize } = require('../url')

test('normalization', () => {
  expect(normalize('http://example.com')).toBe('example.com')
  expect(normalize('https://example.com')).toBe('example.com')
  expect(normalize('foo')).toBe('foo')
  expect(normalize('http://www.google.com')).toBe('google.com')
  expect(normalize('www.google.com')).toBe('google.com')
})

test('is social', () => {
  expect(isSocial(normalize(''))).toBe(false)
  expect(isSocial(normalize('http://example.com'))).toBe(false)
  expect(isSocial(normalize('https://twitter.com'))).toBe(false)
  expect(isSocial(normalize('https://twitter.com/'))).toBe(false)
  expect(isSocial(normalize('https://twitter.com/aaa'))).toBe(true)
  expect(isSocial(normalize('https://www.twitter.com/aaa'))).toBe(true)
  expect(isSocial(normalize('http://mobile.twitter.com/aaa'))).toBe(true)
  expect(isSocial(normalize('twitter.com/aaa'))).toBe(true)
  expect(isSocial(normalize('linkedin.com'))).toBe(false)
  expect(isSocial(normalize('linkedin.com/foo'))).toBe(false)
  expect(isSocial(normalize('linkedin.com/in/xxx'))).toBe(true)
  expect(isSocial(normalize('facebook.com'))).toBe(false)
  expect(isSocial(normalize('http://www.facebook.com/foo'))).toBe(true)
})
