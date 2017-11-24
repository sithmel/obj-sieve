//const toPath = require('lodash/toPath');
const regexpExec = require('iter-tools/lib/regexp-exec');
const map = require('iter-tools/lib/map');


function* toPath(path) {
  const pathRE = new RegExp(
    '\\[' + // the open [
    '([^\\]^\\[]*)' + // anything that is not a bracket
    '\\]' + // closed ]
    '|' + // or
    '([^\\. \\[\\]]+)' // any non empty string without dots/brackets
    , 'g')
  yield* map((result) => result[1] || result[2], regexpExec(pathRE, path));
}



module.exports = toPath;
