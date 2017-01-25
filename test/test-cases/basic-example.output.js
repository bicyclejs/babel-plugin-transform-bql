/* eslint-disable */

function _mergeBqlQueries(firstQuery, secondQuery) { if (secondQuery === null) { return firstQuery; } const result = {}; let firstQueryUpdated = false; let secondQueryUpdated = false; Object.keys(firstQuery).forEach(key => { if (!secondQuery[key]) { firstQueryUpdated = true; result[key] = firstQuery[key]; } else if (firstQuery[key] !== secondQuery[key]) { result[key] = _mergeBqlQueries(firstQuery[key], secondQuery[key]); if (result[key] !== secondQuery[key]) { firstQueryUpdated = true; secondQueryUpdated = true; } } else { result[key] = firstQuery[key]; } }); if (!firstQueryUpdated) { return secondQuery; } Object.keys(secondQuery).forEach(key => { if (!result[key]) { secondQueryUpdated = true; result[key] = secondQuery[key]; } }); return secondQueryUpdated ? result : firstQuery; }

/* global bql, myUserID */

let imageQuery = {
  image: {
    square: true,
    small: true,
    large: true
  },
  fieldWith1Numbers: true
};
const eventQuery = {
  date: true,
  location: true
};
const defaultLength = 10;
var _ref = {
  id: true,
  name: true
};
var _ref2 = {
  image: {
    circle: true
  }
};

var _ref3 = _mergeBqlQueries({
  ["title(length:" + JSON.stringify(10) + ")"]: true
}, eventQuery);

function getQuery(myUserID, includeImage) {
  return {
    ["user(id:" + JSON.stringify(myUserID) + ")"]: _mergeBqlQueries(_ref, includeImage ? _mergeBqlQueries(_ref2, imageQuery) : null),
    "event(day:20,month:\"March\",year:2016) as dayOne": _ref3,
    "event(day:21,month:\"March\",year:2016) as dayTwo": _mergeBqlQueries({
      ["title(length:" + JSON.stringify(defaultLength) + ")"]: true
    }, eventQuery)
  };
}

imageQuery = {
  image: {
    square: true,
    small: true
  }
};

module.exports = getQuery(10, true);