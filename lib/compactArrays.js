const _isArray = require('lodash/isArray');
const _isPlainObject = require('lodash/isPlainObject');
const _pull = require('lodash/pull');

function compactArrays(obj) {
  let output;
  if (_isArray(obj)) {
    _pull(obj, undefined);
    for (var i = 0; i < obj.length; i++) {
      compactArrays(obj[i]);
    }
  } else if (_isPlainObject(obj)){
    for (var k in obj) {
      compactArrays(obj[k]);
    }
  }
}

module.exports = compactArrays;
