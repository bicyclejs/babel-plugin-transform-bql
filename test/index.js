import assert from 'assert';
import fs from 'fs';
import test from 'testit';
import {transformFileSync} from 'babel-core';
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
