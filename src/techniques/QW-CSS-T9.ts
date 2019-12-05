'use strict';

import { CSSTechnique, CSSTechniqueResult } from '@qualweb/css-techniques';
import { CSSStylesheet } from '@qualweb/core';
import css from 'css';

import Technique from './Technique.object';

const technique: CSSTechnique = {
  name: 'Failure of Success Criterion 1.4.8 due to using text that is justified (aligned to both the left and the right margins)',
  code: 'QW-CSS-T9',
  mapping: 'F4',
  description: 'This failure describes situations where blocks of text that are justified (aligned to both the left and the right margins) occurs in CSS, using the \'text-align\' and \'text-justify\' attributes.',
  metadata: {
    target: {
      element: '*',
      attributes: ['text-align','text-justify']
    },
    'success-criteria': [{
      name: '1.4.8',
      level: 'AAA',
      principle: 'Perceivable',
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation'
    }
    ],
    related: ['C22'],
    url: 'https://www.w3.org/WAI/WCAG21/Techniques/failures/F88',
    passed: 0,
    warning: 0,
    failed: 0,
    inapplicable: 0,
    outcome: '',
    description: ''
  },
  results: new Array<CSSTechniqueResult>()
};

class QW_CSS_T9 extends Technique {

  constructor() {
    super(technique);
  }

  async execute(styleSheets: CSSStylesheet[]): Promise<void> {
    console.log("adeus");
    for (const styleSheet of styleSheets || []) {
      if(styleSheet.content && styleSheet.content.plain){
        if (styleSheet.content.plain.includes('text-align')){
          console.log("ola");
          this.analyseAST(styleSheet.content.parsed, styleSheet.file);
        }
      }
    }

    /*if(technique.metadata.failed === 0){
      super.fillEvaluation('passed', `Didn't find any text-decoration:blink properties`);
    }*/
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
    let textJustifyDeclaration, textAlignDeclaration;
    let declarations = cssObject['declarations'];
    if(declarations) {
      for (const declaration of declarations || []) {
        if (declaration['property'] && declaration['value'] ) {
          console.log(declaration['property']);
          if (declaration['property'] === 'text-align') {
            textAlignDeclaration = declaration;
          }
          if(declaration['property'] === 'text-justify'){
            textJustifyDeclaration = declaration;
          }
        }
      }
      this.extractInfo(cssObject, textAlignDeclaration, textJustifyDeclaration, fileName);
    }
  }

  private extractInfo(cssObject: any, textAlignDeclaration: any, textJustifyDeclaration: any, fileName: string): void {
    if (textAlignDeclaration === undefined) {
      //todo fix(?)
      super.fillEvaluation('passed', `Element doesn't have justified text`,
        css.stringify({type: 'stylesheet', stylesheet: {rules: [cssObject]}}),
        fileName, cssObject['selectors'].toString(), cssObject['position']);
    } else if(textJustifyDeclaration === undefined){
      if(textAlignDeclaration['value'] === 'justify') {
        super.fillEvaluation('failed', `Element has the property text-align:justify`,
          css.stringify({type: 'stylesheet', stylesheet: {rules: [cssObject]}}),
          fileName, cssObject['selectors'].toString(), cssObject['position'],
          textAlignDeclaration['property'], textAlignDeclaration['value'], textAlignDeclaration['position']);
      } else {
        super.fillEvaluation('passed', `Element has the property text-align with its value different than justify`,
          css.stringify({type: 'stylesheet', stylesheet: {rules: [cssObject]}}),
          fileName, cssObject['selectors'].toString(), cssObject['position'],
          textAlignDeclaration['property'], textAlignDeclaration['value'], textAlignDeclaration['position']);
      }
    } else {
      if(textAlignDeclaration['value'] === 'justify') {
        if(textJustifyDeclaration['value'] === 'none'){
          super.fillEvaluation('passed', `Element has the property text-align:justify but text-justify:none`,
            css.stringify({type: 'stylesheet', stylesheet: {rules: [cssObject]}}),
            fileName, cssObject['selectors'].toString(), cssObject['position'],
            textJustifyDeclaration['property'], textJustifyDeclaration['value'], textJustifyDeclaration['position']);
        } else {
          super.fillEvaluation('failed', `Element has the property text-align:justify and text-justify with value different than none`,
            css.stringify({type: 'stylesheet', stylesheet: {rules: [cssObject]}}),
            fileName, cssObject['selectors'].toString(), cssObject['position'],
            textJustifyDeclaration['property'], textJustifyDeclaration['value'], textJustifyDeclaration['position']);
        }
      } else {
        //todo sera? mesmo quando existe text-justify?
        super.fillEvaluation('passed', `Element doesn't have justified text`,
          css.stringify({type: 'stylesheet', stylesheet: {rules: [cssObject]}}),
          fileName, cssObject['selectors'].toString(), cssObject['position']);
      }
    }
  }
}

export = QW_CSS_T9;
