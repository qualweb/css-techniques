'use strict';

import { CSSStylesheet } from '@qualweb/core';
import css from 'css';
import Technique from '../lib/Technique.object';
import { CSSTechnique } from '../lib/decorator';

@CSSTechnique
class QW_CSS_T2 extends Technique {

  constructor(technique?: any) {
    super(technique);
  }

  async execute(styleSheets: CSSStylesheet[]): Promise<void> {
    for (const styleSheet of styleSheets || []) {
      if(styleSheet.content && styleSheet.content.plain){
        if (styleSheet.content.plain.includes('text-align')){
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
    if(declarations){
      for (const declaration of declarations || []) {
        if (declaration['property'] && declaration['value']) {
          if (declaration['property'] === 'text-align'){
            this.extractInfo(cssObject, declaration, fileName);
          }else{
            super.fillEvaluation('RC1','failed', `Text block doesn't have alignment property.`,
              css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
              fileName, cssObject['selectors'].toString(), cssObject['position'],
              declaration['property'], declaration['value'], declaration['position']);
          }
        }
      }
    }
  }

  private extractInfo(cssObject: any, declaration: any, fileName: string): void {
    if(declaration['value'].includes('left') || declaration['value'].includes('right')){
      super.fillEvaluation('RC2','passed', `Text block is aligned either left or right.`,
        css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);

    }else if(declaration['value'].includes('justify')){
      super.fillEvaluation('RC3','failed', `Text block is justified.`,
        css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);

    }else if(declaration['value'].includes('center')){
      super.fillEvaluation('RC4','failed', `Text block is centered.`,
        css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);

    }else{
      super.fillEvaluation('RC5','failed', `Text block is aligned neither left nor right.`,
        css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);
    }
  }
}

export = QW_CSS_T2;