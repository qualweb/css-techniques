'use strict';

import { CSSStylesheet } from '@qualweb/core';
import css from 'css';
import { CssUtils } from '@qualweb/util';
import Technique from '../lib/Technique.object';
import { CSSTechnique } from '../lib/decorator';

@CSSTechnique
class QW_CSS_T5 extends Technique {

  containers = ['span', 'article', 'section', 'nav', 'aside', 'hgroup', 'header', 'footer', 'address', 'p', 'hr', 'blockquote', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ul', 'ol', 'dd', 'dt', 'dl', 'figcaption'];
  relativeLengths = ['em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', '%'];

  constructor(technique?: any) {
    super(technique);
  }

  async execute(styleSheets: CSSStylesheet[]): Promise<void> {
    for (const styleSheet of styleSheets || []) {
      if(styleSheet.content && styleSheet.content.plain){
        this.analyseAST(styleSheet.content.parsed, styleSheet.file);
      }
    }
  }

  private analyseAST(cssObject: any, fileName: string): void {
    if (cssObject === undefined ||
      cssObject['type'] === 'comment' ||
      cssObject['type'] === 'keyframes' ||
      cssObject['type'] === 'import'){ // ignore
      return;
    }
    if (cssObject['type'] === 'rule' || cssObject['type'] === 'font-face' || cssObject['type'] === 'page') {
      this.loopDeclarations(cssObject, fileName)
    } else {
      if (cssObject['type'] === 'stylesheet') {
        for (const key of cssObject['stylesheet']['rules'] || []) {
          this.analyseAST(key, fileName);
        }
      } else {
        for (const key of cssObject['rules'] || []) {
          this.analyseAST(key, fileName);
        }
      }
    }
  }

  private loopDeclarations(cssObject: any, fileName: string): void {
    let declarations = cssObject['declarations'];
    if(declarations){
      for (const declaration of declarations || []) {
        if (declaration['property'] && declaration['value'] ) {
          if (declaration['property'] === 'width'){
            this.extractInfo(cssObject, declaration, fileName);
          }
        }
      }
    }
  }

  private extractInfo(cssObject: any, declaration: any, fileName: string): void {
    if(cssObject['selectors'] && this.selectorIsContainer(cssObject['selectors'])){
      for(let unit of this.relativeLengths){
        if(CssUtils.trimImportant(declaration['value']).endsWith(unit)){
          super.fillEvaluation('warning', `Element 'width' style attribute uses ` + unit,
          css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
          fileName, cssObject['selectors'].toString(), cssObject['position'],
          declaration['property'], declaration['value'], declaration['position'])
          return;
        }
      }
      super.fillEvaluation('failed', `Element 'width' style attribute doesn't use a relative length`)
    }
  }

  private selectorIsContainer(selectors: Array<string>): boolean{
    for(const selector of selectors || []){
      const splitSelector = selector.split(' ');
      for (const selector2 of splitSelector) {
        if(this.containers.includes(selector2)) {
          return true;
        }
      }
    }
    return false
  }
}

export = QW_CSS_T5;
