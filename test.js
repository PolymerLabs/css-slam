/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
const chai = require('chai');
// const fs = require('fs');

chai.config.showDiff = true;
const assert = chai.assert;

const slam = require('./');

suite('css-slam', () => {
  suite('CSS', () => {
    test('whitespace is minified', () => {
      const text = `
        div {
          color: blue;
        }

        button {
          border: 2px solid black;
        }
      `;
      const expected = 'div{color:blue;}button{border:2px solid black;}';
      assert.equal(slam.css(text), expected);
    });
    test('fun css features are kept', () => {
      const text = `
      :root {
        --foo: red;
        --border: 2px solid black;
        --thing: {
          box-shadow: 0 0 0 red;
        };
      }

      div {
        color: var(--foo, black);
        border: var(--border, 10px dotted orange);
        @apply --thing;
      }
      `;
      const expected = [
        ':root{',
        '--foo:red;',
        '--border:2px solid black;',
        '--thing:{',
        'box-shadow:0 0 0 red;',
        '};',
        '}',
        'div{',
        'color:var(--foo, black);',
        'border:var(--border, 10px dotted orange);',
        '@apply --thing;',
        '}'
      ].join('');
      assert.equal(slam.css(text), expected);
    })
    test('comments are removed', () => {
      const text = '/* foo */ :root{}';
      const expected = ':root{}';
      assert.equal(slam.css(text), expected);
    });
    test('@license comments are kept', () => {
      const text = '/* @license */ /* bar */ :root{}';
      const expected = '/* @license */:root{}';
      assert.equal(slam.css(text), expected);
    });
  });

  suite('HTML', () => {
    test('inline styles are minified', () => {
      const text = `
      <!doctype html>
      <style>
        :root{
          --foo: red;
        }
      </style>
      <style type="text/css">
        div {
          color: var(--foo);
        }
      </style>`;
      const dom5 = require('dom5');
      const ast = dom5.parse(slam.html(text));
      const styles = dom5.queryAll(ast, dom5.predicates.hasTagName('style'));
      assert.equal(styles.length, 2);
      assert.equal(dom5.getTextContent(styles[0]), ':root{--foo:red;}');
      assert.equal(dom5.getTextContent(styles[1]), 'div{color:var(--foo);}');
    });
  });
});
