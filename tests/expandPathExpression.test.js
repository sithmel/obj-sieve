var assert = require('chai').assert;
var expandPathExpression = require('../lib/expandPathExpression');

describe('expandPathExpression', function () {
  it('expands simple path', function () {
    const paths = Array.from(expandPathExpression('hello', { hello: 1 }));
    assert.deepEqual(paths, [['hello']]);
  });

  it('expands simple path (2)', function () {
    const paths = Array.from(expandPathExpression('hello.world', { hello: { world: 1 } }));
    assert.deepEqual(paths, [['hello', 'world']]);
  });

  it('expands empty path', function () {
    const paths = Array.from(expandPathExpression(undefined, {}));
    assert.deepEqual(paths, []);
  });

  it('expands alternatives', function () {
    const paths = Array.from(expandPathExpression('hello[a|b]', { hello: { a: 1, b: 2 } }));
    assert.deepEqual(paths, [['hello', 'a'], ['hello', 'b']]);
  });

  it('does not consider undefined keys', function () {
    const paths = Array.from(expandPathExpression('hello[a|b]', { hello: { a: 1 } }));
    assert.deepEqual(paths, [['hello', 'a']]);
  });

  it('uses wildchars', function () {
    const paths = Array.from(expandPathExpression('hello[*]', { hello: { a: 1, b: 2 } }));
    assert.deepEqual(paths, [['hello', 'a'], ['hello', 'b']]);
  });

  it('uses wildchars on array', function () {
    const paths = Array.from(expandPathExpression('hello[*]', { hello: [1, 2] }));
    assert.deepEqual(paths, [['hello', 0], ['hello', 1]]);
  });

  it('uses slices', function () {
    const paths = Array.from(expandPathExpression('hello[0:2]', { hello: [1, 2, 3, 4, 5] }));
    assert.deepEqual(paths, [['hello', 0], ['hello', 1]]);
  });

  it('uses slices, no beginning', function () {
    const paths = Array.from(expandPathExpression('hello[:2]', { hello: [1, 2, 3, 4, 5] }));
    assert.deepEqual(paths, [['hello', 0], ['hello', 1]]);
  });

  it('uses slices, no ending', function () {
    const paths = Array.from(expandPathExpression('hello[3:]', { hello: [1, 2, 3, 4, 5] }));
    assert.deepEqual(paths, [['hello', 3], ['hello', 4]]);
  });

  it('uses slices, negative end', function () {
    const paths = Array.from(expandPathExpression('hello[1:-1]', { hello: [1, 2, 3, 4, 5] }));
    assert.deepEqual(paths, [['hello', 1], ['hello', 2], ['hello', 3]]);
  });

  it('uses slices, negative begin', function () {
    const paths = Array.from(expandPathExpression('hello[-2:]', { hello: [1, 2, 3, 4, 5] }));
    assert.deepEqual(paths, [['hello', 3], ['hello', 4]]);
  });

  describe('filter expression', function () {
    it('uses filter expression', function () {
      const paths = Array.from(expandPathExpression('guardians[*][alien=true]',
        {
          guardians: [
            { name: 'Peter Quill', alien: false },
            { name: 'Gamora', alien: true },
            { name: 'Drax', alien: true },
            { name: 'Groot', alien: true },
            { name: 'Rocket Racoon', alien: true },
          ],
        }));
      assert.deepEqual(paths, [
        ['guardians', 1],
        ['guardians', 2],
        ['guardians', 3],
        ['guardians', 4],
      ]);
    });
  });
});
