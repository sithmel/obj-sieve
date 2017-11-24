var assert = require('chai').assert;
var toPath = require('../lib/toPath');

describe('toPath', function () {
  it('convert simple path', function () {
    const a = Array.from(toPath('hello.world.1'));
    assert.deepEqual(a, ['hello', 'world', '1']);
  });

  it('convert simple path with squares', function () {
    const a = Array.from(toPath('hello[world]1'));
    assert.deepEqual(a, ['hello', 'world', '1']);
  });

  it('convert simple path with escapes', function () {
    const a = Array.from(toPath('hello["node.js"]1'));
    assert.deepEqual(a, ['hello', '"node.js"', '1']);
  });

  it('convert simple path with squares, dot in the square', function () {
    const a = Array.from(toPath('hello["world.1.2.3"]1'));
    assert.deepEqual(a, ['hello', '"world.1.2.3"', '1']);
  });

  it('convert simple path with squares, dot in the square 2', function () {
    const a = Array.from(toPath('hello["(world.1.2.3)"]1'));
    assert.deepEqual(a, ['hello', '"(world.1.2.3)"', '1']);
  });

  it('convert simple path with squares, dot in the square 2', function () {
    const a = Array.from(toPath('(hello)["(world.1.2.3)"]1'));
    assert.deepEqual(a, ['(hello)', '"(world.1.2.3)"', '1']);
  });

  it('convert simple path with squares, dot in the square 2', function () {
    const a = Array.from(toPath('hello["1.2.3"4"5.6.7"]1'));
    assert.deepEqual(a, ['hello', '"1.2.3"4"5.6.7"', '1']);
  });

  it('nested brackets', function () {
    const a = Array.from(toPath('[[123]]'));
    assert.deepEqual(a, ['123']);
  });

});
