obj-sieve
=========
Skim an object of unnecessary data.

Why
---
Every time you have a big json to save to a db or to send through the wire you should remove all unneccesary data. This library reduce all the work to a function call with an easy to understand expression.

Importing and creating a sieve instance
---------------------------------------
```js
const Sieve = require('obj-sieve');
const sieve = new Sieve();
```

Example
-------
This is our original object:
```js
const characters = {
  heroes: [
    {
      title: 'mr',
      name: 'Bruce Wayne',
      secretIdentity: 'batman',
      base: 'batcave',
    },
    {
      title: 'mr',
      name: 'Clarke Kent',
      secretIdentity: 'superman',
      base: 'fortress of solitude',
    },
    {
      title: 'princess',
      name: 'Diana Prince',
      secretIdentity: 'wonder woman',
      base: 'Themyscira',
    }
  ],
  villains: [
    {
      title: 'mr',
      name: 'Jack Napier',
      secretIdentity: 'the joker',
      base: 'Unknown',
    }    
  ]
};
```
Let's say you are only interested in heroes, and only their cover identities (you don't want to save secret informations on our db after all!).
You can use this expression:
```js
sieve.include('heroes[:][name|title]');
```
That means every item in "heroes" array, but only the fields "name" and "title" (I explain the path expressions below). You can use the method include multiple times, to add different part of the object you are interested in keeping.
```js
const filteredCharacters = sieve.apply(characters);
```
filteredCharacter contains:
```js
const filteredCharacters = {
  heroes: [
    {
      title: 'mr',
      name: 'Bruce Wayne',
    },
    {
      title: 'mr',
      name: 'Clarke Kent',
    },
    {
      title: 'princess',
      name: 'Diana Prince',
    }
  ],
};
```

Path expressions
================
You can find a full explanation of path expressions here: https://github.com/sithmel/obj-path-expression-parser

A path expression is composed by comma separated paths. Like:
```
hello.world,x.y
```
Every path contains a certain number of fragments. "hello", "world", "x" and "y" are fragments.
Fragments tries to match a value in an object. For example, the expression will find 2 matches in this object:
```
{
  hello: {
    world: 'here'
  },
  x: {
    y: 'and here'
  }
}
```
A fragment can use the globbing syntax to match multiple properties.
```
hello[*]
```
will match:
```
{
  hello: {
    world: 'here'
    mars: 'and here'
  },
  x: {
    y: 'not here'
  }
}
```
You can notice that you can use a dot or square brackets to separate the fragments. Between square brackets you can use any character (but you'll have to escape other square brackets with a backslash). You can also use  escaping to match characters used in globbing (* and ? for example).
Here's what you can do with globbing:
* xyz: it matches only the attribute "xyz"
* xyz|abc: it matches both "xyz" and "abc"
* `*` : it matches all attributes
* !abc: it matches everything except abc
* test?: it matches "test1", "test2", "test3". It doesn't match "test" or "test10"
* test*: it matches "test1", "test2", "test3", "test" and "test10"

When matching an array you can use the slice notation. It uses ":" to separate 2 indexes (it uses the same syntax as Array.prototype.slice, or Python slices).
The first number is where the slice starts. If omitted it will be considered 0.
The second number is where the slice ends. If omitted it will be considered equal to the length of the array.
Negative numbers are calculated from the end of the array.
For Example:
* [:] of [1, 2, 3, 4] = [1, 2, 3, 4] **all**
* [1:] of [1, 2, 3, 4] = [2, 3, 4] **all excepti the first**
* [:1] of [1, 2, 3, 4] = [1] **to the one with index 1**
* [:-1] of [1, 2, 3, 4] = [1, 2, 3] **to the one before the last**
* [1:-1] of [1, 2, 3, 4] = [2, 3] **from the one with index one to the one before the last**
* [-2:] of [1, 2, 3, 4] = [3, 4] **the last 2**

Nested path expressions
-----------------------
A fragment can contain a nested path expression (using round parenthesis):
```
users(x,y,z)name
```
This will match:
```
{
  users: {
    x: { name: 'mr X' },
    y: { name: 'mr Y' },
    z: { name: 'mr Z' },
  }
}
```

Custom functions
----------------
A custom function can be used to enable a more complex filtering. You can add a custom function with:
```js
sieve.setCustomFunctions({
  '=': (path, funcArgument, parent) => {
    const [fieldName, value] = funcArgument.split(',')
    if (_isPlainObject(parent) && _get(parent, fieldName).toString() === value) {
      return [path]
    }
    return []
  }
})
```
Then you can use the custom function like this:
```js
sieve.include('heroes[:]{= title,mr}[name]')
```
You put the custom function between curly braces. The name of the function is the first string ("=" in this case), the argument is the rest of the fragment (title,mr).
A custom function takes the current path, the argument, and the current object.
It should returns an arrays of paths. In the example I am either passing an empty array or an array with a single path. I am filtering what path include and what don't.

exclude
-------
In case you need to filter out some of the content you are including, there is a method exclude.
This method takes a path expression (just like the include method) and uses this to identify what part of the final object we need to remove.
```js
sieve.include('heroes');
sieve.exclude('heroes[:][secretIdentity|base]');
sieve.apply(characters);
```
This is importing the heroes array, and then removing "secretIdentity" and "base".

Additional features
-------------------
The sieve object is JSON serializable:
```js
const json = JSON.stringify(sieve);
```
You can deserialize it like this:
```js
const sieve = new Sieve(JSON.parse(json));
```
A shorthand is also available:
```js
Sieve.filter('hello,world', { hello: 1, world: 2, other: 3});
// returns: { hello: 1, world: 2 }
```
that is equivalent to:
```js
const sieve = new Sieve();
sieve.include('hello');
sieve.include('world');
sieve.apply({ hello: 1, world: 2, other: 3});
// returns: { hello: 1, world: 2 }
```

ES compatibility
----------------
This package is compatible with ES2015 (ES6) as it uses ES generators.
