'use strict';

import { CSSStylesheet } from '@qualweb/core';
import { CSSTechniqueResult } from '@qualweb/css-techniques';
import css from 'css';
import Technique from '../lib/Technique.object';
import { CSSTechnique, ElementExists } from '../lib/decorator';
import { QWElement } from '@qualweb/qw-element';

@CSSTechnique
class QW_CSS_T2 extends Technique {

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
      if (property.includes('text-align')) {
        const textAlign = property.split(':')[1];
        const hasImportant = textAlign.includes('!important');
        
        if (hasImportant) {
          const isJustified = textAlign.includes('justify');
          
          if (!isJustified) {
            evaluation.verdict = 'passed';
            evaluation.description = 'This test target has a text-align css property equal to justify with the important flag.';
            evaluation.resultCode = 'RC1';
          } else {
            evaluation.verdict = 'failed';
            evaluation.description = 'This test target has a text-align css property not equal to justify with the important flag.';
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
      if (styleSheet.content && styleSheet.content.plain) {
        if (styleSheet.content.plain.includes('text-align')) {
          this.analyseAST(styleSheet.content.parsed, styleSheet.file);
        }
      }
    }
  }

  private analyseAST(cssObject: any, fileName: string): void {
    if (cssObject === undefined ||
      cssObject['type'] === 'comment' ||
      cssObject['type'] === 'keyframes' ||
      cssObject['type'] === 'import') { // ignore
      return;
    }
    if (cssObject['type'] === 'rule' || cssObject['type'] === 'font-face' || cssObject['type'] === 'page') {
      if (cssObject['selectors'])
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
    if (declarations) {
      for (const declaration of declarations || []) {
        if (declaration['property'] && declaration['value']) {
          if (declaration['property'] === 'text-align') {
            this.extractInfo(cssObject, declaration, fileName);
          }else{
            super.fillEvaluation('RC1','inapplicable', `Text block doesn't have alignment property.`,
              css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
              fileName, cssObject['selectors'].toString(), cssObject['position'],
              declaration['property'], declaration['value'], declaration['position']);
          }
        }
      }
    }
  }

  private extractInfo(cssObject: any, declaration: any, fileName: string): void {
    if (declaration['value'].includes('left') || declaration['value'].includes('right')) {
      super.fillEvaluation('RC2', 'passed', `Text block is aligned either left or right.`,
        css.stringify({ type: 'stylesheet', stylesheet: { rules: [cssObject] } }),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);

    } else if (declaration['value'].includes('justify')) {
      super.fillEvaluation('RC3', 'failed', `Text block is justified.`,
        css.stringify({ type: 'stylesheet', stylesheet: { rules: [cssObject] } }),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);

    } else if (declaration['value'].includes('center')) {
      super.fillEvaluation('RC4', 'failed', `Text block is centered.`,
        css.stringify({ type: 'stylesheet', stylesheet: { rules: [cssObject] } }),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);

    } else {
      super.fillEvaluation('RC5', 'failed', `Text block is aligned neither left nor right.`,
        css.stringify({ type: 'stylesheet', stylesheet: { rules: [cssObject] } }),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);
    }
  }
}

export = QW_CSS_T2;
