var _toPath = require('lodash/toPath');

function expandExpressionFragment(path, expression, obj) {
  yield path.concat(expression);
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
  yield* iterPath;
}

// [3:6] [:2] [3:] [5:-2] slice
// * all
// [key1|key2]

module.exports = expandPathExpression;
