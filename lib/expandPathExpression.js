const _get = require('lodash/get');
const _isArray = require('lodash/isArray');
const _isPlainObject = require('lodash/isPlainObject');
const micromatch = require('micromatch');
const range = require('iter-tools/lib/range');
const map = require('iter-tools/lib/map');
const toPath = require('./toPath');

const sliceRE = /([\-0-9]*):([\-0-9]*)/;
const filterRE = /([^=]*)=([^=]*)/;

function* expandExpressionFragment(path, expression, obj) {
  const parent = path.length ? _get(obj, path) : obj;
  // is it slice ?
  const slices = sliceRE.exec(expression);
  const filter = filterRE.exec(expression);
  const parentIsArray = _isArray(parent);
  const parentIsObject = _isPlainObject(parent);
  if (parentIsObject && filter) {
    // uses filter syntax
    const key = filter[1];
    const valueMatch = filter[2];
    if (micromatch.isMatch(parent[key].toString(), valueMatch)) {
      yield path;
    }
  } else if (parentIsArray && slices) {
    // uses slice syntax
    const len = parent.length;
    let start = slices[1] === '' ? 0 : parseInt(slices[1], 10);
    let end = slices[2] === '' ? len : parseInt(slices[2], 10);
    start = start >= 0 ? start : len + start;
    end = end > 0 ? end : len + end;
    yield* map((n) => path.concat(n), range({ start, end }))
  } else if (parentIsObject || parentIsArray) {
    // uses globbing on keys/indexes
    const matchingKeys = micromatch(Object.keys(parent), expression)
      .map(parentIsArray ? (m) => parseInt(m, 10) : (m) => m);
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
  const pathArray = toPath(pathExpression);
  for (const pathFragment of pathArray) {
    iterPath = iterOverPath(iterPath, pathFragment, obj);
  }
  if (iterPath) {
    yield* iterPath;
  }
}

module.exports = expandPathExpression;
