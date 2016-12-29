import assert from 'assert';
import TokenStream from 'token-stream';

function parse(tokens) {
  tokens = new TokenStream(tokens);
  function parseArg() {
    const identifier = tokens.advance();
    assert(identifier.type === 'Identifier');

    const colon = tokens.advance();
    assert(colon.type === 'Colon');

    const val = tokens.advance();

    return {type: 'Arg', name: identifier.val, val};
  }
  function parseArgs() {
    const openBracket = tokens.advance();
    assert(openBracket.type === 'Bracket' && openBracket.val === '(');
    const args = [];
    while (tokens.peek().type !== 'Bracket') {
      args.push(parseArg());
    }
    const closeBracket = tokens.advance();
    assert(closeBracket.type === 'Bracket' && closeBracket.val === ')');
    return args;
  }
  function parseFieldSet() {
    const openBracket = tokens.advance();
    assert(openBracket.type === 'Bracket' && openBracket.val === '{');
    const body = parseBody();
    const closeBracket = tokens.advance();
    assert(closeBracket.type === 'Bracket' && closeBracket.val === '}');
    return {type: 'FieldSet', body};
  }
  function parseAlias() {
    const keyword = tokens.advance();
    assert(keyword.type === 'Keyword' && keyword.val === 'as');
    const identifier = tokens.advance();
    assert(identifier.type === 'Identifier');
    return identifier.val;

  }
  function parseField() {
    const identifier = tokens.advance();
    assert(identifier.type === 'Identifier');
    let args = null;
    let body = null;
    let alias = null;
    if (tokens.peek().type === 'Bracket' && tokens.peek().val === '(') {
      args = parseArgs();
    }
    if (tokens.peek().type === 'Keyword' && tokens.peek().val === 'as') {
      alias = parseAlias();
      if (alias === identifier.val) alias = null;
    }
    if (tokens.peek().type === 'Bracket' && tokens.peek().val === '{') {
      body = parseFieldSet();
    }
    return {type: 'Field', name: identifier.val, args, alias, body};
  }
  function parseSpread() {
    const spread = tokens.advance();
    assert(spread.type === 'Spread');
    const arg = tokens.advance();
    assert(arg.type === 'Expression');
    return {type: 'Spread', arg};
  }
  function parseBody() {
    const body = [];
    while ((tokens.peek().type !== 'Bracket' || tokens.peek().val !== '}') && tokens.peek().type !== 'End') {
      switch (tokens.peek().type) {
        case 'Identifier':
          body.push(parseField());
          break;
        case 'Spread':
          body.push(parseSpread());
          break;
        /*
        case 'Keyword':
          body.push(parseKeyword());
          break;
        */
        default:
          throw new Error('Unexpected token ' + tokens.peek().type + '\n' + JSON.stringify(tokens.peek(), null, '  '));
      }
    }
    return body;
  }
  return {type: 'FieldSet', body: parseBody()};
}
export default parse;
