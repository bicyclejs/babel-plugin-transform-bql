import assert from 'assert';
import fs from 'fs';
import test from 'testit';
import { transformFileSync } from '@babel/core';
import babelPluginTransformClassProperties from '@babel/plugin-proposal-class-properties';
import babelPluginTransformClasses from '@babel/plugin-transform-classes';
import babelPluginTransformModules from '@babel/plugin-transform-modules-commonjs';
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
  assert.deepEqual(require('./test-cases/basic-example.output.js'), {
    'user(id:10)': {
      id: true,
      name: true,
      image: { circle: true, square: true, small: true },
    },
    'event(day:20,month:"March",year:2016) as dayOne': { 'title(length:10)': true, date: true, location: true },
    'event(day:21,month:"March",year:2016) as dayTwo': { 'title(length:10)': true, date: true, location: true }
  });
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
      ],
    },
  );
  assert(
    output.code.indexOf('import') === -1,
    'did not expect an import statement in output because we are using the modules transform',
  );
  fs.writeFileSync(__dirname + '/test-cases/classes-interaction.output.js', '/* eslint-disable */\n\n' + output.code);
  assert.deepEqual(require('./test-cases/classes-interaction.output.js'), {
    a: true,
    b: true
  });
});

function snapshotError(message, filename) {
  const msg = message.split('/')[0].split('\\')[0] + filename + message.split(filename)[1];
  const snapshotName = __dirname + '/test-cases/' + filename.replace(/\.js$/, '.error');
  try {
    const expected = fs.readFileSync(snapshotName, 'utf8');
    assert.equal(msg, expected);
  } catch (ex) {
    if (ex.code !== 'ENOENT') {
      throw ex;
    }
    fs.writeFileSync(snapshotName, msg);
  }
}
function testError(name, debugMode) {
  test('errors on ' + name, () => {
    if (debugMode) {
      transformFileSync(
        __dirname + '/test-cases/' + name + '.js',
        {
          babelrc: false,
          plugins: [babelPluginTransformBql],
        },
      );
    } else {
      assert.throws(
        () => {
          transformFileSync(
            __dirname + '/test-cases/' + name + '.js',
            {
              babelrc: false,
              plugins: [babelPluginTransformBql],
            },
          );
        },
        err => {
          snapshotError(err.message, name + '.js');
          return true;
        }
      );
    }
  });
}
testError('duplicate-arg');
testError('duplicate-arg-2');
testError('duplicate-key');
testError('duplicate-key-2');
testError('extra-bracket');
testError('missmatched-brackets');
testError('missmatched-brackets-2');
testError('missing-closing-quote');
