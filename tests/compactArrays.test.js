/* eslint-env node, mocha */
const assert = require('chai').assert
const compactArrays = require('../lib/compactArrays')

describe('compactArrays', function () {
  it('compact an array', function () {
    const a = [undefined, undefined, 0, 1, 2]
    compactArrays(a)
    assert.deepEqual(a, [0, 1, 2])
  })

  it('compact an array recursively', function () {
    const a = {
      test1: [undefined, 0, undefined, 1, 2],
      test2: { test3: [undefined, undefined, 0, 1, 2, undefined] }
    }
    compactArrays(a)
    assert.deepEqual(a, {
      test1: [0, 1, 2],
      test2: { test3: [0, 1, 2] }
    })
  })

  it('compact an array recursively, avoiding circular references', function () {
    const a = {
      test1: [undefined, 0, undefined, 1, 2]
    }
    a.test1.push(a)
    compactArrays(a)
    assert.equal(a.test1[0], 0)
    assert.equal(a.test1[1], 1)
    assert.equal(a.test1[2], 2)
    assert.equal(a.test1[3], a)
  })
})
