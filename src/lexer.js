import getError from 'babel-code-frame';

const BRACKETS = ['(', ')', '{', '}'];

function lex({quasis, expressions}, file) {
  const tokens = [];
  quasis.forEach((quasi, i) => {
    let str = quasi.value.raw;
    function trim() {
      while (str !== str.trim() || str[0] === ',') {
        str = str.trim();
        if (str[0] === ',') str = str.substr(1);
      }
    }
    function lexKeyword() {
      const match = /^(if|else|as)\b/.exec(str);
      if (match) {
        const start = getLocation();
        str = str.substr(match[0].length);
        return {type: 'Keyword', val: match[0], loc: {start, end: getLocation()}};
      }
      return null;
    }
    function lexString() {
      if (str[0] === '"' || str[0] === '\'') {
        const start = getLocation();
        const quote = str[0];
        let val = '';
        let escaped = false;
        let i = 1;
        while (i < str.length && (escaped || str[i] !== quote)) {
          if (str[i] === '\\') escaped = true;
          if (str[i] === '"' && !escaped) val += '\\';
          val += str[i++];
        }
        if (str[i] === quote) {
          str = str.substr(i + 1);
          return {type: 'String', val: JSON.parse('"' + val + '"'), loc: {start, end: getLocation()}};
        } else {
          throw new Error('Missing closing quote\n\n' + getError(file.code, start.line, start.column));
        }
      }
      return null;
    }
    function lexBool() {
      const match = /^(true|false)\b/.exec(str);
      if (match) {
        const start = getLocation();
        str = str.substr(match[0].length);
        return {type: 'Bool', val: match[0] === 'true', loc: {start, end: getLocation()}};
      }
      return null;
    }
    function lexNumber() {
      const match = /^\-?[\d\_]+(\.[\d\_]+)?/.exec(str);
      if (match) {
        const start = getLocation();
        str = str.substr(match[0].length);
        return {type: 'Number', val: parseInt(match[0].replace(/\_/g, ''), 10), loc: {start, end: getLocation()}};
      }
      return null;
    }
    function lexBracket() {
      if (BRACKETS.indexOf(str[0]) !== -1) {
        const start = getLocation();
        const match = str[0];
        str = str.substr(1);
        return {type: 'Bracket', val: match, loc: {start, end: getLocation()}};
      }
      return null;
    }
    function lexColon() {
      if (str[0] === ':') {
        const start = getLocation();
        str = str.substr(1);
        return {type: 'Colon', loc: {start, end: getLocation()}};
      }
      return null;
    }
    function lexSpread() {
      if (str[0] === '.' && str[1] === '.' && str[2] === '.') {
        const start = getLocation();
        str = str.substr(3);
        return {type: 'Spread', loc: {start, end: getLocation()}};
      }
      return null;
    }
    function lexIdentifier() {
      const match = /^[a-zA-Z][a-zA-Z0-9]*\b/.exec(str);
      if (match) {
        const start = getLocation();
        str = str.substr(match[0].length);
        return {type: 'Identifier', val: match[0], loc: {start, end: getLocation()}};
      }
      return null;
    }
    function lexComment() {
      if (str[0] === '/' && str[1] === '/') {
        str = str.substr(str.indexOf('\n'));
        return true;
      }
      return false;
    }
    function getLocation() {
      let {line, column} = quasi.loc.start;
      for (let i = 0; i < quasi.value.raw.length - str.length; i++) {
        if (quasi.value.raw[i] === '\n') {
          line++;
          column = 0;
        } else {
          column++;
        }
      }
      return {line, column};
    }
    function fail() {
      const loc = getLocation();
      throw new Error(
        'Unexpected character ' + JSON.stringify(str[0]) + '\n\n' +
          getError(file.code, loc.line, loc.column),
      );
    }
    trim();
    while (str.length) {
      if (!lexComment()) {
        tokens.push(
          lexKeyword() ||
          lexString() ||
          lexBool() ||
          lexNumber() ||
          lexBracket() ||
          lexColon() ||
          lexSpread() ||
          lexIdentifier() ||
          fail()
        );
      }
      trim();
    }
    if (expressions[i]) {
      tokens.push({type: 'Expression', val: expressions[i], loc: expressions[i].loc});
    }
  });
  const endLoc = quasis[quasis.length - 1].loc.end;
  tokens.push({type: 'End', loc: {start: endLoc, end: endLoc}});
  return tokens;
}
export default lex;
