/* global bql */
// See issue #1

const assert = require('assert');
const foo = {a: true};
class MyClass {
  static query = bql`...${foo},b`;
}
assert.deepEqual(MyClass.query, {a: true, b: true});

module.exports = MyClass.query;
