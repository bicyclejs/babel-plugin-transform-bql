import getError from 'babel-code-frame';

function codeGen(t, ast, {getMergeBqlQueries, file}) {
  getMergeBqlQueries();
  function error(msg, node) {
    throw new Error(msg + '\n\n' + getError(file.code, node.loc.start.line, node.loc.start.column));
  }
  function assert(value, msg, node) {
    if (!value) {
      throw error(msg, node);
    }
  }
  const JSONStringify = t.memberExpression(
    t.identifier('JSON'),
    t.identifier('stringify'),
  );
  function genFieldSet(ast) {
    assert(ast.type === 'FieldSet', 'Expected FieldSet', ast);
    const properties = ast.body.filter(
      node => node.type !== 'Spread' && node.type !== 'Conditional',
    ).map(genNode);
    const merge = ast.body.filter(node => node.type === 'Spread');
    const conditionals = ast.body.filter(node => node.type === 'Conditional');
    let obj = t.objectExpression(properties);
    obj._isBqlOutput = true;
    merge.forEach(node => {
      obj = t.callExpression(
        getMergeBqlQueries(),
        [
          obj,
          node.arg.val,
        ],
      );
      obj._isBqlOutput = true;
    });
    conditionals.forEach(({condition, consequent, alternate}) => {
      obj = t.callExpression(
        getMergeBqlQueries(),
        [
          obj,
          t.conditionalExpression(
            condition.val,
            genFieldSet(consequent),
            alternate ? genFieldSet(alternate) : t.nullLiteral(),
          ),
        ],
      );
      obj._isBqlOutput = true;
    });
    return obj;
  }
  function isConstantValue(value) {
    return value.type === 'String' || value.type === 'Bool' || value.type === 'Number';
  }
  function genField(ast) {
    assert(ast.type === 'Field', 'Expected Field', ast);
    const name = ast.name;
    let value = null;
    if (ast.body) {
      value = genFieldSet(ast.body);
    } else {
      value = t.booleanLiteral(true);
    }
    if (!ast.args || ast.args.length === 0) {
      return t.objectProperty(
        ast.alias
          ? t.stringLiteral(name + ' as ' + ast.alias)
          : t.identifier(name),
        value,
      );
    } else {
      const args = ast.args.slice().sort(
        (a, b) => (a.name < b.name ? -1 : 1),
      );
      const parts = [name + '('];
      function push(str) {
        if (typeof parts[parts.length - 1] === 'string') {
          parts[parts.length - 1] += str;
        } else {
          parts.push(str);
        }
      }
      args.forEach((arg, i) => {
        assert(arg.type === 'Arg', 'Expected Arg', arg);
        if (i !== 0) {
          push(',');
        }
        push(arg.name);
        push(':');
        if (isConstantValue(arg.val)) {
          push(JSON.stringify(arg.val.val));
        } else {
          parts.push(arg.val.val);
        }
      });
      push(')');
      if (ast.alias) {
        push(' as ' + ast.alias);
      }
      if (parts.length === 1) {
        return t.objectProperty(t.stringLiteral(parts[0]), value);
      } else {
        return t.objectProperty(
          parts.map(
            part => (
              typeof part === 'string'
                ? t.stringLiteral(part)
                : t.callExpression(
                  JSONStringify,
                  [part]
                )
            ),
          ).reduce((left, right) => t.binaryExpression(
            '+',
            left,
            right
          )),
          value,
          true // computed
        );
      }
    }
  }
  function genNode(ast) {
    switch (ast.type) {
      case 'FieldSet':
        return genFieldSet(ast);
      case 'Field':
        return genField(ast);
      default:
        throw error('Unexpeced node type ' + ast.type, ast);
    }
  }
  return genNode(ast);
}
export default codeGen;
