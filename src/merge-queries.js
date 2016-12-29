/* eslint no-unused-vars: 0, new-cap: 0 */

function MERGE_QUERIES(firstQuery, secondQuery) {
  if (secondQuery === null) {
    return firstQuery;
  }
  const result = {};
  let firstQueryUpdated = false;
  let secondQueryUpdated = false;
  Object.keys(firstQuery).forEach(key => {
    if (!secondQuery[key]) {
      firstQueryUpdated = true;
      result[key] = firstQuery[key];
    } else if (firstQuery[key] !== secondQuery[key]) {
      result[key] = MERGE_QUERIES(firstQuery[key], secondQuery[key]);
      if (result[key] !== secondQuery[key]) {
        firstQueryUpdated = true;
        secondQueryUpdated = true;
      }
    } else {
      result[key] = firstQuery[key];
    }
  });
  if (!firstQueryUpdated) {
    return secondQuery;
  }
  Object.keys(secondQuery).forEach(key => {
    if (!result[key]) {
      secondQueryUpdated = true;
      result[key] = secondQuery[key];
    }
  });
  return secondQueryUpdated ? result : firstQuery;
}
