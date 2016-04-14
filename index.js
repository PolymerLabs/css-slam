/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
'use strict';
const dom5 = require('dom5');
const shadyCSS = require('shady-css-parser');

class NoCommentStringifier extends shadyCSS.Stringifier {
  comment(node) {
    const value = node.value;
    if (value.indexOf('@license') >= 0) {
      return value;
    }
    return '';
  }
}

const parser = new shadyCSS.Parser();
const stringifier = new NoCommentStringifier();
const pred = dom5.predicates;
const isInlineStyle = pred.AND(
  pred.hasTagName('style'),
  pred.OR(
    pred.NOT(
      pred.hasAttr('type')
    ),
    pred.hasAttrValue('type', 'text/css')
  )
);

/**
 * Transforms all inline styles in `html` with `filter`
 */
function html(text) {
  const ast = dom5.parse(text);
  dom5.queryAll(ast, isInlineStyle).forEach(styleNode => {
    const text = dom5.getTextContent(styleNode);
    dom5.setTextContent(styleNode, css(text));
  });
  return dom5.serialize(ast);
}

function css(text) {
  return stringifier.stringify(parser.parse(text));
}

module.exports = {html, css};
