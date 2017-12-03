const _isArray = require('lodash/isArray')
const _isPlainObject = require('lodash/isPlainObject')
const _pull = require('lodash/pull')

function compactArrays (object) {
  const alreadySeen = []
  function _compactArrays (obj) {
    if (alreadySeen.indexOf(obj) !== -1) {
      return
    }
    alreadySeen.push(obj)
    if (_isArray(obj)) {
      _pull(obj, undefined)
      for (var i = 0; i < obj.length; i++) {
        _compactArrays(obj[i])
      }
    } else if (_isPlainObject(obj)) {
      for (var k in obj) {
        _compactArrays(obj[k])
      }
    }
  }
  _compactArrays(object)
}

module.exports = compactArrays
