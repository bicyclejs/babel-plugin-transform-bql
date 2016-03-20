const BRACKETS = ['(', ')', '{', '}'];

function lex({quasis, expressions}) {
  const tokens = [];
  quasis.forEach((quasi, i) => {
    let str = quasi.value.raw;
    // TODO: track line number within quasi
    const line = quasi.loc.start.line;
    function trim() {
      while (str !== str.trim() || str[0] === ',') {
        str = str.trim();
        if (str[0] === ',') str = str.substr(1);
      }
    }
    function lexKeyword() {
      const match = /^(if|else|as)\b/.exec(str);
      if (match) {
        str = str.substr(match[0].length);
        return {type: 'Keyword', val: match[0], line};
      }
      return null;
    }
    function lexString() {
      if (str[0] === '"' || str[0] === '\'') {
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
          return {type: 'String', val: JSON.parse('"' + val + '"'), line};
        } else {
          throw new Error('Missing closing quote');
        }
      }
      return null;
    }
    function lexBool() {
      const match = /^(true|false)\b/.exec(str);
      if (match) {
        str = str.substr(match[0].length);
        return {type: 'Bool', val: match[0] === 'true', line};
      }
      return null;
    }
    function lexNumber() {
      const match = /^\-?\d+(\.\d+)?/.exec(str);
      if (match) {
        str = str.substr(match[0].length);
        return {type: 'Number', val: +match[0], line};
      }
      return null;
    }
    function lexBracket() {
      if (BRACKETS.indexOf(str[0]) !== -1) {
        const match = str[0];
        str = str.substr(1);
        return {type: 'Bracket', val: match, line};
      }
      return null;
    }
    function lexColon() {
      if (str[0] === ':') {
        str = str.substr(1);
        return {type: 'Colon', line};
      }
      return null;
    }
    function lexSpread() {
      if (str[0] === '.' && str[1] === '.' && str[2] === '.') {
        str = str.substr(3);
        return {type: 'Spread', line};
      }
      return null;
    }
    function lexIdentifier() {
      const match = /^[a-zA-Z]+\b/.exec(str);
      if (match) {
        str = str.substr(match[0].length);
        return {type: 'Identifier', val: match[0], line};
      }
      return null;
    }
    function fail() {
      throw new Error('Unable to lex at "' + str + '"');
    }
    trim();
    while (str.length) {
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
      trim();
    }
    if (expressions[i]) {
      tokens.push({type: 'Expression', val: expressions[i]});
    }
  });
  tokens.push({type: 'End'});
  return tokens;
}
export default lex;
