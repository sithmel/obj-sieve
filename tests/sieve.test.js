var assert = require('chai').assert;
var Sieve = require('..');

describe('sieve', function () {
  it('is an object', function () {
    assert.typeOf(new Sieve(), 'object');
  });

  it('adds a path', function () {
    const sieve = new Sieve();
    sieve.add('hello');
    assert.deepEqual(sieve._paths, ['hello']);
  });

  it('can be serialised', function () {
    const sieve = new Sieve();
    sieve.add('hello');
    sieve.add('world');
    assert.equal(JSON.stringify(sieve), '["hello","world"]');
  });

  it('can be deserialised', function () {
    const sieve = new Sieve(['hello', 'world']);
    assert.deepEqual(sieve._paths, ['hello', 'world']);
  });

  it('filters an object', function () {
    const sieve = new Sieve();
    sieve.add('hello');
    const newObj = sieve.apply({
      hello: 1,
      world: 2
    });
    assert.deepEqual(newObj, { hello: 1});
  });

  it('filters an object with a complex expression', function () {
    const sieve = new Sieve();
    sieve.add('users[-2:][*Name]');
    const newObj = sieve.apply({
      users: [
        { title: 'mr', FirstName: 'Bruce', lastName: 'Wayne'},
        { title: 'mr', FirstName: 'Clarke', lastName: 'Kent'},
        { title: 'ms', FirstName: 'Diana', lastName: 'Prince'},
        { title: 'mr', FirstName: 'Barry', lastName: 'Allen'},
        { title: 'mr', FirstName: 'Arthur', lastName: 'Curry'}
      ]
    });
    assert.deepEqual(newObj, {
      users: [
        undefined,
        undefined,
        undefined,
        { FirstName: 'Barry', lastName: 'Allen'},
        { FirstName: 'Arthur', lastName: 'Curry'}
      ]
    });
  });

});
