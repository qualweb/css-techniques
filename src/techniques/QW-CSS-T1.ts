'use strict';

import { CSSStylesheet } from '@qualweb/core';
import { CSSTechniqueResult } from '@qualweb/css-techniques';
import css from 'css';
import { CssUtils } from '@qualweb/util';
import Technique from '../lib/Technique.object';
import { CSSTechnique, ElementExists } from '../lib/decorator';
import { QWElement } from '@qualweb/qw-element';

@CSSTechnique
class QW_CSS_T1 extends Technique {

  constructor(technique?: any) {
    super(technique);
  }

  @ElementExists
  executeElement(element: QWElement): void {

    if (element.getElementTagName() === 'style') {
      const sheet = <any> element.getElementProperty('sheet');
      for (const rule of sheet.cssRules || []) {
        const style = rule.style.cssText;
        this.checkCssProperty(style, element);
      }
    } else {
      const style = <string> element.getElementAttribute('style');
      this.checkCssProperty(style, element);
    }
  }

  private checkCssProperty(style: string, element: QWElement): void {
    
    const evaluation: CSSTechniqueResult = {
      verdict: '',
      description: '',
      resultCode: ''
    };

    const properties = style.split(';').filter(p => p.trim() !== '') || [style];
      
    for (const property of properties) {
      if (property.includes('font-size')) {
        const fontSize = property.split(':')[1];
        const hasImportant = fontSize.includes('!important');
        
        if (hasImportant) {
          const hasAbsoluteUnit = fontSize.includes('cm') || fontSize.includes('mm') || fontSize.includes('in') || fontSize.includes('px') || fontSize.includes('pt') || fontSize.includes('pt');
          
          if (!hasAbsoluteUnit) {
            evaluation.verdict = 'passed';
            evaluation.description = 'This test target has a font-size css property using an relative unit value with the important flag.';
            evaluation.resultCode = 'RC1';
          } else {
            evaluation.verdict = 'failed';
            evaluation.description = 'This test target has a font-size css property using an absolute unit value with the important flag.';
            evaluation.resultCode = 'RC2';
          }

          evaluation.pointer = element.getElementSelector();
          evaluation.htmlCode = element.getElementHtmlCode(true, true);
          evaluation.attributes = property;

          super.addEvaluationResult(evaluation);
        }
      }
    }
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
      super.fillEvaluation('RC1','failed', `Element 'font-size' style attribute uses 'px'`,
        css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position'])
    } else if(CssUtils.trimImportant(declaration['value']).endsWith('em') || //C14 passed
              CssUtils.trimImportant(declaration['value']).endsWith('%') || //C12 passed
              names.includes(CssUtils.trimImportant(declaration['value']).trim())){// C13 passed
      super.fillEvaluation('RC2','passed', `Element 'font-size' style attribute doesn't use 'px'`,
        css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);
    } else {
      super.fillEvaluation('RC3','inapplicable', `Element has 'font-size' style with unknown metric`)
    }
  }
}

export = QW_CSS_T1;
