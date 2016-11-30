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
import File = require('vinyl');
import * as dom5 from 'dom5';
import * as parse5 from 'parse5';
import {Transform} from 'stream';
import {Comment, Stringifier as CSSStringifier, Parser as CSSParser} from 'shady-css-parser';

class NoCommentStringifier extends CSSStringifier {
  comment(node: Comment): string {
    const value = node.value;
    if (value.indexOf('@license') >= 0) {
      return value;
    }
    return '';
  }
}

const parser = new CSSParser();
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
export function html(text: string): string {
  const ast = parse5.parse(text);
  dom5.queryAll(ast, isInlineStyle).forEach(styleNode => {
    const text = dom5.getTextContent(styleNode);
    dom5.setTextContent(styleNode, css(text));
  });
  return parse5.serialize(ast);
}

export function css(text: string): string {
  return stringifier.stringify(parser.parse(text));
}


export class GulpTransform extends Transform {
  constructor() {
    super({objectMode: true});
  }
  _transform(file: File, _encoding: string, callback: (err: Error|null, file?: File) => void) {
    if (file.isStream()) {
      return callback(new Error('css-slam does not support streams'));
    }
    if (file.contents) {
      let contents: string;
      if (file.path.slice(-5) === '.html') {
        contents = file.contents.toString();
        file.contents = new Buffer(html(contents));
      } else if (file.path.slice(-4) === '.css') {
        contents = file.contents.toString();
        file.contents = new Buffer(css(contents));
      }
    }
    callback(null, file);
  }
}

export function gulp(): GulpTransform {
  return new GulpTransform();
}
