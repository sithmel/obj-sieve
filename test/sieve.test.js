/* eslint-env node, mocha */
const assert = require('chai').assert
const Sieve = require('..')
const _isPlainObject = require('lodash/isPlainObject')
const _get = require('lodash/get')

describe('sieve', function () {
  it('is an object', function () {
    assert.typeOf(new Sieve(), 'object')
  })

  it('adds a path', function () {
    const sieve = new Sieve()
    sieve.include('hello')
    assert.deepEqual(sieve._paths.include, ['hello'])
  })

  it('can be serialised', function () {
    const sieve = new Sieve()
    sieve.include('hello')
    sieve.include('world')
    assert.equal(JSON.stringify(sieve), '{"include":["hello","world"],"exclude":[]}')
  })

  it('can be deserialised', function () {
    const sieve = new Sieve({ include: ['hello.world'] })
    assert.deepEqual(sieve._paths.include, ['hello.world'])
  })

  it('filters an object', function () {
    const sieve = new Sieve()
    sieve.include('hello')
    const newObj = sieve.apply({
      hello: 1,
      world: 2
    })
    assert.deepEqual(newObj, { hello: 1 })
  })

  it('filters an object, using shorthand', function () {
    const newObj = Sieve.filter('hello', {
      hello: 1,
      world: 2
    })
    assert.deepEqual(newObj, { hello: 1 })
  })

  it('filters an object with a complex expression', function () {
    const sieve = new Sieve()
    sieve.include('users[-2:][*Name]')
    const newObj = sieve.apply({
      users: [
        { title: 'mr', FirstName: 'Bruce', lastName: 'Wayne' },
        { title: 'mr', FirstName: 'Clarke', lastName: 'Kent' },
        { title: 'ms', FirstName: 'Diana', lastName: 'Prince' },
        { title: 'mr', FirstName: 'Barry', lastName: 'Allen' },
        { title: 'mr', FirstName: 'Arthur', lastName: 'Curry' }
      ]
    })
    assert.deepEqual(newObj, {
      users: [
        { FirstName: 'Barry', lastName: 'Allen' },
        { FirstName: 'Arthur', lastName: 'Curry' }
      ]
    })
  })

  it('filters an object with a complex expression (2)', function () {
    const sieve = new Sieve()
    sieve.include('heroes[:][name|title]')
    const newObj = sieve.apply({
      heroes: [
        {
          title: 'mr',
          name: 'Bruce Wayne',
          secretIdentity: 'batman',
          base: 'batcave'
        },
        {
          title: 'mr',
          name: 'Clarke Kent',
          secretIdentity: 'superman',
          base: 'fortress of solitude'
        },
        {
          title: 'princess',
          name: 'Diana Prince',
          secretIdentity: 'wonder woman',
          base: 'Themyscira'
        }
      ],
      villains: [
        {
          title: 'mr',
          name: 'Jack Napier',
          secretIdentity: 'the joker',
          base: 'Unknown'
        }
      ]
    })
    assert.deepEqual(newObj, {
      heroes: [
        {
          title: 'mr',
          name: 'Bruce Wayne'
        },
        {
          title: 'mr',
          name: 'Clarke Kent'
        },
        {
          title: 'princess',
          name: 'Diana Prince'
        }
      ]
    })
  })

  it('filters an object with a complex expression, using exclude', function () {
    const sieve = new Sieve()
    sieve.include('heroes[:][name|title]')
    sieve.exclude('heroes[:][title]')
    const newObj = sieve.apply({
      heroes: [
        {
          title: 'mr',
          name: 'Bruce Wayne',
          secretIdentity: 'batman',
          base: 'batcave'
        },
        {
          title: 'mr',
          name: 'Clarke Kent',
          secretIdentity: 'superman',
          base: 'fortress of solitude'
        },
        {
          title: 'princess',
          name: 'Diana Prince',
          secretIdentity: 'wonder woman',
          base: 'Themyscira'
        }
      ],
      villains: [
        {
          title: 'mr',
          name: 'Jack Napier',
          secretIdentity: 'the joker',
          base: 'Unknown'
        }
      ]
    })
    assert.deepEqual(newObj, {
      heroes: [
        {
          name: 'Bruce Wayne'
        },
        {
          name: 'Clarke Kent'
        },
        {
          name: 'Diana Prince'
        }
      ]
    })
  })

  it('includes everything when there is no include', function () {
    const sieve = new Sieve()
    sieve.exclude('heroes[0:2],villains')
    const newObj = sieve.apply({
      heroes: [
        {
          title: 'mr',
          name: 'Bruce Wayne',
          secretIdentity: 'batman',
          base: 'batcave'
        },
        {
          title: 'mr',
          name: 'Clarke Kent',
          secretIdentity: 'superman',
          base: 'fortress of solitude'
        },
        {
          title: 'princess',
          name: 'Diana Prince',
          secretIdentity: 'wonder woman',
          base: 'Themyscira'
        }
      ],
      villains: [
        {
          title: 'mr',
          name: 'Jack Napier',
          secretIdentity: 'the joker',
          base: 'Unknown'
        }
      ]
    })
    assert.deepEqual(newObj, {
      heroes: [
        {
          title: 'princess',
          name: 'Diana Prince',
          secretIdentity: 'wonder woman',
          base: 'Themyscira'
        }
      ]
    })
  })

  it('filters an object with a complex expression, using exclude, using filter expression', function () {
    const sieve = new Sieve()
    sieve.setCustomFunctions({
      '=': (path, funcArgument, parent) => {
        const [fieldName, value] = funcArgument.split(',')
        if (_isPlainObject(parent) && _get(parent, fieldName).toString() === value) {
          return [path]
        }
        return []
      }
    })
    sieve.include('heroes[:]{= title,mr}[name]')
    const newObj = sieve.apply({
      heroes: [
        {
          title: 'mr',
          name: 'Bruce Wayne',
          secretIdentity: 'batman',
          base: 'batcave'
        },
        {
          title: 'mr',
          name: 'Clarke Kent',
          secretIdentity: 'superman',
          base: 'fortress of solitude'
        },
        {
          title: 'princess',
          name: 'Diana Prince',
          secretIdentity: 'wonder woman',
          base: 'Themyscira'
        }
      ],
      villains: [
        {
          title: 'mr',
          name: 'Jack Napier',
          secretIdentity: 'the joker',
          base: 'Unknown'
        }
      ]
    })
    assert.deepEqual(newObj, {
      heroes: [
        {
          name: 'Bruce Wayne'
        },
        {
          name: 'Clarke Kent'
        }
      ]
    })
  })
})
