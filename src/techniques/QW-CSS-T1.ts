'use strict';

import { CSSStylesheet } from '@qualweb/core';
import css from 'css';
import { CssUtils } from '@qualweb/util';
import Technique from '../lib/Technique.object';
import { CSSTechnique } from '../lib/decorator';

@CSSTechnique
class QW_CSS_T1 extends Technique {

  constructor(technique?: any) {
    super(technique);
  }

  async execute(styleSheets: CSSStylesheet[]): Promise<void> {
    for (const styleSheet of styleSheets || []) {
      if(styleSheet.content && styleSheet.content.plain){
        if (styleSheet.content.plain.includes('font-size')){
          this.analyseAST(styleSheet.content.parsed, styleSheet.file);
        }
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
          if (declaration['property'] === 'font-size'){
            this.extractInfo(cssObject, declaration, fileName);
          }
        }
      }
    }
  }

  private extractInfo(cssObject: any, declaration: any, fileName: string): void {
    const names = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xsmaller', 'larger'];

    if(CssUtils.trimImportant(declaration['value']).includes('px')){
      super.fillEvaluation('failed', `Element 'font-size' style attribute uses 'px'`,
        css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position'])
    } else if(CssUtils.trimImportant(declaration['value']).endsWith('em') || //C14 passed
              CssUtils.trimImportant(declaration['value']).endsWith('%') || //C12 passed
              names.includes(CssUtils.trimImportant(declaration['value']).trim())){// C13 passed
      super.fillEvaluation('passed', `Element 'font-size' style attribute doesn't use 'px'`,
        css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);
    } else {
      super.fillEvaluation('inapplicable', `Element has 'font-size' style with unknown metric`)
    }
  }
}

export = QW_CSS_T1;
