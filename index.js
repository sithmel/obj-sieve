const _get = require('lodash/get');
const _set = require('lodash/set');
const _isUndefined = require('lodash/isUndefined');
const _isArray = require('lodash/isArray');
const compactArrays = require('./lib/compactArrays');
const expandPathExpression = require('./lib/expandPathExpression');

function Sieve(paths) {
  if (!(this instanceof Sieve)) {
    return new Sieve(path);
  }
  this._paths = paths || [];
}

Sieve.prototype.include = function include(path) {
  this._paths.push(path);
  return this;
};

Sieve.prototype.toJSON = function () {
  return this._paths;
};

Sieve.prototype.apply = function (obj) {
  const output = {};
  for (const pathEpression of this._paths) {
    for (const path of expandPathExpression(pathEpression, obj)) {
      const value = _get(obj, path);
      if (!_isUndefined(value)) {
        _set(output, path, value);
      }
    }
  }
  compactArrays(output);
  return output;
};

Sieve.filter = function filter(paths, obj) {
  paths = _isArray(paths) ? paths : paths.split(',');
  const sieve = new Sieve();
  for (const path of paths) {
    sieve.include(path);
  }
  return sieve.apply(obj);
}

module.exports = Sieve;
