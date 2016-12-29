import {readFileSync} from 'fs';
import template from 'babel-template';
import lex from './lexer';
import parse from './parser';
import codeGen from './code-gen';

const buildHelper = template(readFileSync(__dirname + '/merge-queries.js', 'utf8').trim());

export default function (babel) {
  const {types: t} = babel;
  function isBqlReference(node) {
    // TODO: do this better
    return t.isIdentifier(node, {name: 'bql'});
  }
  function isCallTo(node, name) {
    return (
      t.isCallExpression(node) &&
      t.isIdentifier(node.callee) &&
      node.callee.name === name
    );
  }
  // check if a variable is every mutated
  const mutatedVisitor = {
    Identifier(path, state) {
      if (path.node.name === state.name) {
        const node = path.parentPath.node;
        const key = path.parentKey;
        const isMutation = (
          (t.isAssignmentExpression(node) && key === 'left') ||
          t.isUpdateExpression(node)
        );
        if (isMutation) {
          state.isMutated = true;
          path.stop();
        }
      }
    },
  };

  // check if an expression is "safeish" to hoist
  const immutabilityVisitor = {
    ReferencedIdentifier(path, state) {
      if (path.node.name === 'JSON') {
        return;
      }
      // the only identifiers we'll treat as immutable are mergeBqlQueries and the queries being merged
      if (!state.mergeBqlQueries) {
        state.isImmutable = false;
        path.stop();
        return;
      }
      if (path.node.name === state.mergeBqlQueries.name) {
        return;
      }
      let parent = path.parentPath;
      while (!t.isStatement(parent.node) && !isCallTo(parent.node, state.mergeBqlQueries.name)) {
        if (t.isObjectExpression(parent.node)) {
          state.isImmutable = false;
          path.stop();
          return;
        }
        parent = parent.parentPath;
      }
      const s = {isMutated: false, name: path.node.name};
      state.filePath.traverse(mutatedVisitor, s);
      if (s.isMutated) {
        state.isImmutable = false;
        path.stop();
      }
    },
    enter(path, state) {
      if (path.isImmutable()) {
        return;
      }
      if (path.isIdentifier()) {
        return;
      }
      if (
        state.mergeBqlQueries &&
        isCallTo(path.node, state.mergeBqlQueries.name)
      ) {
        return;
      }
      if (
        t.isCallExpression(path.node) &&
        t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.object) &&
        path.node.callee.object.name === 'JSON' &&
        path.node.callee.computed === false &&
        t.isIdentifier(path.node.callee.property) &&
        path.node.callee.property.name === 'stringify'
      ) {
        return;
      }

      // see if the node is constant providing its children are constant
      const isConstant = (
        t.isArrayExpression(path.node) ||
        t.isBinaryExpression(path.node) ||
        t.isBooleanLiteral(path.node) ||
        t.isConditionalExpression(path.node) ||
        t.isLogicalExpression(path.node) ||
        t.isMemberExpression(path.node) ||
        t.isNullLiteral(path.node) ||
        t.isNumericLiteral(path.node) ||
        t.isObjectExpression(path.node) ||
        t.isObjectMethod(path.node) ||
        t.isObjectProperty(path.node) ||
        t.isParenthesizedExpression(path.node) ||
        t.isSequenceExpression(path.node) ||
        t.isSpreadElement(path.node) ||
        t.isSpreadProperty(path.node) ||
        t.isStringLiteral(path.node) ||
        t.isTemplateLiteral(path.node) ||
        false
      );
      if (isConstant) {
        return;
      }
      state.isImmutable = false;
      path.stop();
    },
  };
  function getMergeBqlQueries(file) {
    if (file._mergeBqlQueries) return file._mergeBqlQueries;
    file._mergeBqlQueries = file.scope.generateUidIdentifier('mergeBqlQueries');
    const helper = buildHelper({
      MERGE_QUERIES: file._mergeBqlQueries,
    });
    helper.body._compact = true;
    helper._generated = true;
    file.path.unshiftContainer("body", helper);
    return file._mergeBqlQueries;
  }
  return {
    visitor: {
      TaggedTemplateExpression(path) {
        if (isBqlReference(path.node.tag)) {
          const tokens = lex(path.node.quasi);
          const ast = parse(tokens);
          const transformed = codeGen(t, ast, {
            getMergeBqlQueries: () => {
              return getMergeBqlQueries(this.file);
            },
          });
          path.replaceWith(transformed);
        }
      },
      ObjectExpression(path) {
        if (!path.node._isBqlOutput || path.node._hoisted) {
          return;
        }

        const state = {isImmutable: true, mergeBqlQueries: this.file._mergeBqlQueries, filePath: this.file.path};
        path.traverse(immutabilityVisitor, state);

        if (state.isImmutable) {
          path.hoist();
        } else {
          path.node._hoisted = true;
        }
      },
      CallExpression(path) {
        if (!path.node._isBqlOutput || path.node._hoisted) {
          return;
        }

        const state = {isImmutable: true, mergeBqlQueries: this.file._mergeBqlQueries, filePath: this.file.path};
        path.traverse(immutabilityVisitor, state);

        if (state.isImmutable) {
          path.hoist();
        } else {
          path.node._hoisted = true;
        }
      },
    },
  };
}
