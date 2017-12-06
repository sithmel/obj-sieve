const _get = require('lodash/get')
const _isUndefined = require('lodash/isUndefined')
const _isPlainObject = require('lodash/isPlainObject')
const Delta = require('obj-delta')

const expressionParser = require('obj-path-expression-parser')

function Sieve (paths) {
  if (!(this instanceof Sieve)) {
    return new Sieve(paths)
  }
  this._paths = paths || {}
  this._paths.include = this._paths.include || []
  this._paths.exclude = this._paths.exclude || []
  this._customFunctions = {}
}

Sieve.prototype.setCustomFunctions = function setCustomFunctions (customFunctions) {
  this._customFunctions = customFunctions || {}
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
  const delta = new Delta()
  const includePaths = this._paths.include.length ? this._paths.include : ['*']
  for (const pathEpression of includePaths) {
    for (const path of expressionParser(pathEpression, obj, this._customFunctions)) {
      const value = _get(obj, path)
      if (!_isUndefined(value)) {
        delta.set(path, value)
      }
    }
  }

  for (const pathEpression of this._paths.exclude) {
    for (const path of expressionParser(pathEpression, obj, this._customFunctions)) {
      delta.del(path)
    }
  }
  const output = delta.apply({})
  return output
}

Sieve.filter = function filter (paths, obj, customFunctions) {
  let include
  let exclude
  if (_isPlainObject(paths)) {
    include = paths.include
    exclude = paths.exclude
  } else {
    include = paths
  }
  const sieve = new Sieve()
  sieve.setCustomFunctions(customFunctions)
  include && sieve.include(include)
  exclude && sieve.exclude(exclude)
  return sieve.apply(obj)
}

module.exports = Sieve
