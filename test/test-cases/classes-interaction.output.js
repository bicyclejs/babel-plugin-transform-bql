/* eslint-disable */

"use strict";

function _mergeBqlQueries(firstQuery, secondQuery) { if (secondQuery === null) { return firstQuery; } const result = {}; let firstQueryUpdated = false; let secondQueryUpdated = false; for (let key in firstQuery) { if (key in firstQuery) { if (!secondQuery[key]) { firstQueryUpdated = true; result[key] = firstQuery[key]; } else if (firstQuery[key] !== secondQuery[key]) { result[key] = _mergeBqlQueries(firstQuery[key], secondQuery[key]); if (result[key] !== secondQuery[key]) { firstQueryUpdated = true; secondQueryUpdated = true; } } else { result[key] = firstQuery[key]; } } } if (!firstQueryUpdated) { return secondQuery; } for (let key in secondQuery) { if (key in secondQuery && !result[key]) { secondQueryUpdated = true; result[key] = secondQuery[key]; } } return secondQueryUpdated ? result : firstQuery; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* global bql */
// See issue #1
const assert = require('assert');

const foo = {
  a: true
};

let MyClass = function MyClass() {
  _classCallCheck(this, MyClass);
};

_defineProperty(MyClass, "query", _mergeBqlQueries({
  b: true
}, foo));

assert.deepEqual(MyClass.query, {
  a: true,
  b: true
});
module.exports = MyClass.query;