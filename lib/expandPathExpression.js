const _toPath = require('lodash/toPath');
const _get = require('lodash/get');
const _isArray = require('lodash/isArray');
const _isPlainObject = require('lodash/isPlainObject');
const micromatch = require('micromatch');
const range = require('iter-tools/lib/range');
const map = require('iter-tools/lib/map');

const sliceRE = /([\-0-9]*):([\-0-9]*)/;

function* expandExpressionFragment(path, expression, obj) {
  const parent = path.length ? _get(obj, path) : obj;
  if (_isArray(parent)) {
    // is it slice ?
    const slices = sliceRE.exec(expression);
    if (slices) {
      const len = parent.length;
      let start = slices[1] === '' ? 0 : parseInt(slices[1], 10);
      let end = slices[2] === '' ? len : parseInt(slices[2], 10);
      start = start >= 0 ? start : len + start;
      end = end > 0 ? end : len + end;
      yield* map((n) => path.concat(n), range({ start, end }))
    } else {
      yield path.concat(expression);
    }
  } else if (_isPlainObject(parent)) {
    // uses globbing on keys
    const matchingKeys = micromatch(Object.keys(parent), expression);
    yield* matchingKeys.map((alt) => path.concat(alt));
  }
}

function* iterOverPath(pathIter, expression, obj) {
  if (pathIter) {
    for (const path of pathIter) {
      yield* expandExpressionFragment(path, expression, obj);
    }
  } else {
    yield* expandExpressionFragment([], expression, obj);
  }
}

function* expandPathExpression(pathExpression, obj) {
  let iterPath;
  const pathArray = _toPath(pathExpression);
  for (const pathFragment of pathArray) {
    iterPath = iterOverPath(iterPath, pathFragment, obj);
  }
  if (iterPath) {
    yield* iterPath;
  }
}

module.exports = expandPathExpression;
