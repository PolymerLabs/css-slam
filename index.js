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
const shadyCss = require('shady-css-parser');

class NoCommentStringifier extends shadyCss.Stringifier {
  [shadyCss.nodeType.comment](node) {
    if (node.value.indexOf('@license') >= 0) {
      return node.value;
    }
    return '';
  }
}

const parser = new shadyCss.Parser();
const stringifier = new NoCommentStringifier();

/**
 * Transforms all inline styles in `html` with `filter`
 */
function html(text) {
  var p = dom5.predicates;
  var ast = dom5.parse(text);
  var isInlineStyle = p.AND(
    p.hasTagName('style'),
    p.OR(
      p.NOT(
        p.hasAttr('type')
      ),
      p.hasAttrValue('type', 'text/css')
    )
  );
  for (let styleNode of dom5.queryAll(ast, isInlineStyle)) {
    const text = dom5.getTextContent(styleNode);
    dom5.setTextContent(styleNode, css(text));
  }
  return dom5.serialize(ast);
}

function css(text) {
  return stringifier.stringify(parser.parse(text));
}

module.exports = {html, css};
