const _get = require('lodash/get')
const _set = require('lodash/set')
const _isUndefined = require('lodash/isUndefined')
const _isArray = require('lodash/isArray')
const _isPlainObject = require('lodash/isPlainObject')
const compactArrays = require('./compactArrays')

const expressionParser = require('obj-path-expression-parser')

function Sieve (paths) {
  if (!(this instanceof Sieve)) {
    return new Sieve(paths)
  }
  this._paths = paths || {}
  this._paths.include = this._paths.include || []
  this._paths.exclude = this._paths.exclude || []
}

Sieve.prototype.include = function include (path) {
  this._paths.include.push(path)
  return this
}

Sieve.prototype.exclude = function include (path) {
  this._paths.exclude.push(path)
  return this
}

Sieve.prototype.toJSON = function () {
  return this._paths
}

Sieve.prototype.apply = function (obj) {
  const output = {}
  for (const pathEpression of this._paths.include) {
    for (const path of expressionParser(pathEpression, obj)) {
      const value = _get(obj, path)
      if (!_isUndefined(value)) {
        _set(output, path, value)
      }
    }
  }

  for (const pathEpression of this._paths.exclude) {
    for (const path of expressionParser(pathEpression, output)) {
      const parentObj = _get(output, path.slice(0, -1))
      delete parentObj[path[path.length - 1]]
    }
  }
  compactArrays(output)
  return output
}

const strOrArray = (s) => _isArray(s) ? s : s.split(',')

Sieve.filter = function filter (paths, obj) {
  let includeList
  let excludeList
  if (_isPlainObject(paths)) {
    includeList = strOrArray(paths.include || [])
    excludeList = strOrArray(paths.exclude || [])
  } else {
    includeList = strOrArray(paths)
    excludeList = []
  }
  const sieve = new Sieve()
  for (const path of includeList) {
    sieve.include(path)
  }
  for (const path of excludeList) {
    sieve.exclude(path)
  }
  return sieve.apply(obj)
}

module.exports = Sieve
