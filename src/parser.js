import TokenStream from 'token-stream';
import getError from '@babel/code-frame';

function parse(tokens, file) {
  tokens = new TokenStream(tokens);
  function error(msg, tokenOrNode) {
    throw new Error(msg + '\n\n' + getError(file.code, tokenOrNode.loc.start.line, tokenOrNode.loc.start.column));
  }
  function assert(value, msg, token) {
    if (!value) {
      throw error(msg, token);
    }
  }
  function parseArg() {
    const identifier = tokens.advance();
    assert(identifier.type === 'Identifier', 'Expected an identifier', identifier);

    const colon = tokens.advance();
    assert(colon.type === 'Colon', 'Expected a colon', colon);

    const val = tokens.advance();
    assert(
      val.type === 'Expression' ||
        val.type === 'String' ||
        val.type === 'Bool' ||
        val.type === 'Number',
      'Expected an expression, string, boolean or number',
      val,
    );

    return {type: 'Arg', name: identifier.val, val, loc: {start: identifier.loc.start, end: identifier.loc.end}};
  }
  function parseArgs() {
    const openBracket = tokens.advance();
    assert(openBracket.type === 'Bracket' && openBracket.val === '(', 'Expected an open round brackets', openBracket);
    const args = [];
    while (tokens.peek().type !== 'Bracket') {
      const arg = parseArg();
      if (args.some(a => a.name === arg.name)) {
        throw error('Duplicate argument with name ' + JSON.stringify(arg.name), arg);
      }
      args.push(arg);

    }
    const closeBracket = tokens.advance();
    assert(
      closeBracket.type === 'Bracket' && closeBracket.val === ')',
      'Expected a close round brackets',
      closeBracket,
    );
    return args;
  }
  function parseFieldSet() {
    const openBracket = tokens.advance();
    assert(openBracket.type === 'Bracket' && openBracket.val === '{', 'Expected open curly bracket', openBracket);
    const body = parseBody();
    const closeBracket = tokens.advance();
    assert(closeBracket.type === 'Bracket' && closeBracket.val === '}', 'Expected close curly bracket', closeBracket);
    return {type: 'FieldSet', body, loc: {start: openBracket.loc.start, end: closeBracket.loc.end}};
  }
  function parseAlias() {
    const keyword = tokens.advance();
    assert(keyword.type === 'Keyword' && keyword.val === 'as', 'Expected "as" keyword', keyword);
    const identifier = tokens.advance();
    assert(identifier.type === 'Identifier', 'Expected identifier', identifier);
    return identifier.val;

  }
  function parseField() {
    const identifier = tokens.advance();
    assert(identifier.type === 'Identifier', 'Expected identifier', identifier);
    let end = identifier.loc.end;
    let args = null;
    let body = null;
    let alias = null;
    if (tokens.peek().type === 'Bracket' && tokens.peek().val === '(') {
      args = parseArgs();
      if (args.length) {
        end = args[args.length - 1].loc.end;
      }
    }
    if (tokens.peek().type === 'Keyword' && tokens.peek().val === 'as') {
      end = tokens.peek().loc.end;
      alias = parseAlias();
      if (alias === identifier.val) alias = null;
    }
    if (tokens.peek().type === 'Bracket' && tokens.peek().val === '{') {
      body = parseFieldSet();
      end = body.loc.end;
    }
    return {type: 'Field', name: identifier.val, args, alias, body, loc: {start: identifier.loc.start, end}};
  }
  function parseSpread() {
    const spread = tokens.advance();
    assert(spread.type === 'Spread', 'Expected spread element', spread);
    const arg = tokens.advance();
    assert(arg.type === 'Expression', 'Expected expression', arg);
    return {type: 'Spread', arg, loc: {start: spread.loc.start, end: arg.loc.end}};
  }
  function parseKeyword() {
    const keyword = tokens.advance();
    assert(keyword.type === 'Keyword' && keyword.val === 'if', 'Expected "if" keyword', keyword);
    const condition = tokens.advance();
    assert(condition.type === 'Expression', 'Expected expression', condition);
    const consequent = parseFieldSet();
    let alternate = null;
    if (tokens.peek().type !== 'Keyword' && tokens.peek().val === 'else') {
      tokens.advance();
      alternate = parseFieldSet();
    }
    return {
      type: 'Conditional',
      condition,
      consequent,
      alternate,
      loc: {start: keyword.loc.start, end: (alternate || consequent).loc.end},
    };
  }
  function parseBody() {
    const body = [];
    const usedIdentifiers = [];
    while ((tokens.peek().type !== 'Bracket' || tokens.peek().val !== '}') && tokens.peek().type !== 'End') {
      switch (tokens.peek().type) {
        case 'Identifier':
          const field = parseField();
          assert(
            typeof field.name === 'string',
            'Field.name should be a string',
            field,
          );
          assert(
            field.alias === null || typeof field.alias === 'string',
            'Field.alias should be a string or null',
            field,
          );
          const fieldName = field.alias || field.name;
          if (usedIdentifiers.indexOf(fieldName) !== -1) {
            throw error('Duplicate key ' + JSON.stringify(fieldName), field);
          }
          usedIdentifiers.push(fieldName);
          body.push(field);
          break;
        case 'Spread':
          body.push(parseSpread());
          break;
        case 'Keyword':
          body.push(parseKeyword());
          break;
        default:
          throw error(
            'Unexpected token ' + tokens.peek().type + ', expected Identifier, Spread or Keyword',
            tokens.peek(),
          );
      }
    }
    return body;
  }
  const start = tokens.peek().loc.start;
  const body = parseBody();
  const eof = tokens.advance();
  assert(eof.type === 'End', 'Unexpected token ' + eof.type, eof);
  return {
    type: 'FieldSet', body, loc: {start, end: eof.loc.end},
  };
}
export default parse;
