import lex from './lexer';
import parse from './parser';
import codeGen from './code-gen';

export default function (babel) {
  const {types: t} = babel;
  function isBqlReference(node) {
    // TODO: do this better
    return t.isIdentifier(node, {name: 'bql'});
  }
  return {
    visitor: {
      TaggedTemplateExpression(path) {
        if (isBqlReference(path.node.tag)) {
          const tokens = lex(path.node.quasi);
          const ast = parse(tokens);
          const transformed = codeGen(t, ast);
          path.replaceWith(transformed);
        }
      },
    },
  };
}
