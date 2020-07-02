'use strict';

import { CSSStylesheet } from '@qualweb/core';
import { CSSTechniqueResult } from '@qualweb/css-techniques';
import css from 'css';
import { CssUtils } from '@qualweb/util';
import Technique from '../lib/Technique.object';
import { CSSTechnique, ElementExists } from '../lib/decorator';
import { QWPage } from '@qualweb/qw-page';
import { QWElement } from '@qualweb/qw-element';
import intersection from 'lodash.intersection';

@CSSTechnique
class QW_CSS_T5 extends Technique {

  private containers = ['span', 'article', 'section', 'nav', 'aside', 'hgroup', 'header', 'footer', 'address', 'p', 'hr', 'blockquote', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ul', 'ol', 'dd', 'dt', 'dl', 'figcaption'];
  private relativeLengths = ['em', 'ex', 'ch', 'rem', 'vw', 'vh', 'vmin', 'vmax', '%'];

  constructor(technique?: any) {
    super(technique);
  }

  @ElementExists
  executeElement(element: QWElement, page: QWPage): void {

    if (element.getElementTagName() === 'style') {
      const sheet = <any> element.getElementProperty('sheet');
      
      for (const rule of sheet.cssRules || []) {
        if (rule.style.cssText.includes('width:') && this.checkIfCssSelectorIsApplicable(rule, page)) {
          const style = rule.style.cssText;
          this.checkCssProperty(style, element);
        }
      }
    } else {
      const style = <string> element.getElementAttribute('style');
      this.checkCssProperty(style, element);
    }
  }

  private checkIfCssSelectorIsApplicable(rule: any, page: QWPage): boolean {
    const selectors = rule.selectorText.split(',').map(s => s.trim()) || [rule.selectorText.trim()];
    const hasContainers = intersection(selectors, this.containers);

    if (hasContainers.length > 0) {
      return true;
    }

    let affectsContainers = false;
    for (const selector of selectors || []) {
      if (selector.startsWith('.') || selector.startsWith('#')) {
        const elements = page.getElements(selector);
        for (const element of elements || []) {
          if (this.containers.includes(element.getElementTagName())) {
            affectsContainers = true;
            break;
          }
        }
      }
    }

    return affectsContainers;
  }

  private checkCssProperty(style: string, element: QWElement): void {
    
    const evaluation: CSSTechniqueResult = {
      verdict: '',
      description: '',
      resultCode: ''
    };

    const properties = style.split(';').filter(p => p.trim() !== '') || [style];
      
    for (const property of properties) {
      if (property.includes('width')) {
        const width = property.split(':')[1];
        const hasImportant = width.includes('!important');
        
        if (hasImportant) {
          let hasRelativeUnit = false;
          
          for (const unit of this.relativeLengths) {
            if (width.includes(unit)) {
              hasRelativeUnit = true;
              break;
            }
          }

          if (hasRelativeUnit) {
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
          super.fillEvaluation('RC1','warning', `Element 'width' style attribute uses ` + unit,
          css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
          fileName, cssObject['selectors'].toString(), cssObject['position'],
          declaration['property'], declaration['value'], declaration['position'])
          return;
        }
      }
      super.fillEvaluation('RC2','failed', `Element 'width' style attribute doesn't use a relative length`)
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
