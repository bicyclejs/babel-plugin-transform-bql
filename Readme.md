# babel-plugin-transform-bql

Transform the high level bicycle query language within template strings into the object spec expected by bicycle

[![Build Status](https://img.shields.io/travis/bicyclejs/babel-plugin-transform-bql/master.svg)](https://travis-ci.org/bicyclejs/babel-plugin-transform-bql)
[![Dependency Status](https://img.shields.io/david/bicyclejs/babel-plugin-transform-bql/master.svg)](http://david-dm.org/bicyclejs/babel-plugin-transform-bql)
[![NPM version](https://img.shields.io/npm/v/babel-plugin-transform-bql.svg)](https://www.npmjs.org/package/babel-plugin-transform-bql)

## Installation

```
npm install babel-plugin-transform-bql --save
```

## Example

```js
const query = bql`
  user(id: ${myUserID}) {
    id,
    name
  }
  event(year: 2016, month: 3, day: 20) {
    title
  }
`;

console.log(query);
```

Compiles to:

```js
const query = {
  ["user(id:" + JSON.stringify(myUserID) + ")"]: {
    id: true,
    name: true
  },
  "event(day:20,month:3,year:2016)": {
    title: true
  }
};

console.log(query);
```

## License

MIT
