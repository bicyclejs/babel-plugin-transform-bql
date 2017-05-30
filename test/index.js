import assert from 'assert';
import fs from 'fs';
import test from 'testit';
import {transformFileSync} from 'babel-core';
import babelPluginTransformClassProperties from 'babel-plugin-transform-class-properties';
import babelPluginTransformClasses from 'babel-plugin-transform-es2015-classes';
import babelPluginTransformModules from 'babel-plugin-transform-es2015-modules-commonjs';
import babelPluginTransformRuntime from 'babel-plugin-transform-runtime';
import babelPluginTransformBql from '../src';

test('transforms code correctly', () => {
  const output = transformFileSync(
    __dirname + '/test-cases/basic-example.js',
    {
      babelrc: false,
      plugins: [babelPluginTransformBql],
    },
  );
  fs.writeFileSync(__dirname + '/test-cases/basic-example.output.js', '/* eslint-disable */\n\n' + output.code);
  console.log(require('./test-cases/basic-example.output.js'));
});

test('transforms code correctly with classes', () => {
  const output = transformFileSync(
    __dirname + '/test-cases/classes-interaction.js',
    {
      babelrc: false,
      plugins: [
        babelPluginTransformBql,
        babelPluginTransformClassProperties,
        babelPluginTransformClasses,
        babelPluginTransformModules,
        babelPluginTransformRuntime,
      ],
    },
  );
  assert(
    output.code.indexOf('import') === -1,
    'did not expect an import statement in output because we are using the modules transform',
  );
  fs.writeFileSync(__dirname + '/test-cases/classes-interaction.output.js', '/* eslint-disable */\n\n' + output.code);
  console.log(require('./test-cases/classes-interaction.output.js'));
});
