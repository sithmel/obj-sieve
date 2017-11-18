var _get = require('lodash/get');
var _set = require('lodash/set');
var _isUndefined = require('lodash/isUndefined');
var expandPathExpression = require('./lib/expandPathExpression');

function Sieve(paths) {
  this._paths = paths || [];
}

Sieve.prototype.pass = function pass(path) {
  this._paths.push(path);
};

Sieve.prototype.toJSON = function () {
  return JSON.stringify(this._paths);
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
  return output;
};
