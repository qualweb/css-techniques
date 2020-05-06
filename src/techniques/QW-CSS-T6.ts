'use strict';

import { CSSStylesheet } from '@qualweb/core';
import css from 'css';
import Technique from '../lib/Technique.object';
import { CSSTechnique } from '../lib/decorator';

@CSSTechnique
class QW_CSS_T6 extends Technique {

  constructor(technique?: any) {
    super(technique);
  }

  async execute(styleSheets: CSSStylesheet[]): Promise<void> {
    for (const styleSheet of styleSheets || []) {
      if(styleSheet.content && styleSheet.content.plain){
        if (styleSheet.content.plain.includes('text-decoration')){
          this.analyseAST(styleSheet.content.parsed, styleSheet.file);
        }
      }
    }

    if(super.getNumberOfFailedResults() === 0){
      super.fillEvaluation('passed', `Didn't find any text-decoration:blink properties`);
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
      if(cssObject['selectors'])
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
    if(declarations) {
      for (const declaration of declarations || []) {
        if (declaration['property'] && declaration['value'] ) {
          if (declaration['property'] === 'text-decoration') {
            this.extractInfo(cssObject, declaration, fileName);
          }
        }
      }
    }
  }

  private extractInfo(cssObject: any, declaration: any, fileName: string): void {
    if(declaration['value'] === 'blink'){
      super.fillEvaluation('failed', `Element has the property text-decoration:blink.`,
      css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
      fileName, cssObject['selectors'].toString(), cssObject['position'],
      declaration['property'], declaration['value'], declaration['position']);
    }
  }
}

export = QW_CSS_T6;