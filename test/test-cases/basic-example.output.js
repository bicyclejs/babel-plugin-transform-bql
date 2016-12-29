/* eslint-disable */

function _mergeBqlQueries(firstQuery, secondQuery) { const result = {}; let firstQueryUpdated = false; let secondQueryUpdated = false; Object.keys(firstQuery).forEach(key => { if (!secondQuery[key]) { firstQueryUpdated = true; result[key] = firstQuery[key]; } else if (firstQuery[key] !== secondQuery[key]) { result[key] = _mergeBqlQueries(firstQuery[key], secondQuery[key]); if (result[key] !== secondQuery[key]) { firstQueryUpdated = true; secondQueryUpdated = true; } } else { result[key] = firstQuery[key]; } }); if (!firstQueryUpdated) { return secondQuery; } Object.keys(secondQuery).forEach(key => { if (!result[key]) { secondQueryUpdated = true; result[key] = secondQuery[key]; } }); return secondQueryUpdated ? result : firstQuery; }

/* global bql, myUserID */

let imageQuery = {
  image: {
    square: true,
    small: true,
    large: true
  }
};
const eventQuery = {
  date: true,
  location: true
};
const defaultLength = 10;
var _ref = {
  id: true,
  name: true,
  image: {
    circle: true
  }
};

var _ref2 = _mergeBqlQueries({
  ["title(length:" + JSON.stringify(10) + ")"]: true
}, eventQuery);

function getQuery(myUserID) {
  return {
    ["user(id:" + JSON.stringify(myUserID) + ")"]: _mergeBqlQueries(_ref, imageQuery),
    "event(day:20,month:\"March\",year:2016) as dayOne": _ref2,
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

module.exports = getQuery(10);