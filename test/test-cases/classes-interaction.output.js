/* eslint-disable */

'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _mergeBqlQueries(firstQuery, secondQuery) { if (secondQuery === null) { return firstQuery; } const result = {}; let firstQueryUpdated = false; let secondQueryUpdated = false; for (let key in firstQuery) { if (key in firstQuery) { if (!secondQuery[key]) { firstQueryUpdated = true; result[key] = firstQuery[key]; } else if (firstQuery[key] !== secondQuery[key]) { result[key] = _mergeBqlQueries(firstQuery[key], secondQuery[key]); if (result[key] !== secondQuery[key]) { firstQueryUpdated = true; secondQueryUpdated = true; } } else { result[key] = firstQuery[key]; } } } if (!firstQueryUpdated) { return secondQuery; } for (let key in secondQuery) { if (key in secondQuery && !result[key]) { secondQueryUpdated = true; result[key] = secondQuery[key]; } } return secondQueryUpdated ? result : firstQuery; }

/* global bql */
// See issue #1

const assert = require('assert');
const foo = { a: true };

let MyClass = function MyClass() {
  (0, _classCallCheck3.default)(this, MyClass);
};

MyClass.query = _mergeBqlQueries({
  b: true
}, foo);

assert.deepEqual(MyClass.query, { a: true, b: true });

module.exports = MyClass.query;