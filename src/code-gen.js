import assert from 'assert';

function codeGen(t, ast) {
  const JSONStringify = t.memberExpression(
    t.identifier('JSON'),
    t.identifier('stringify'),
  );
  function genFieldSet(ast) {
    assert(ast.type === 'FieldSet');
    const properties = ast.body.map(genNode);
    return t.objectExpression(properties);
  }
  function isConstantValue(value) {
    return value.type === 'String' || value.type === 'Bool' || value.type === 'Number';
  }
  function genField(ast) {
    assert(ast.type === 'Field');
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
        assert(arg.type === 'Arg');
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
        throw new Error('Unexpeced node type ' + ast.type);
    }
  }
  return genNode(ast);
}
export default codeGen;
