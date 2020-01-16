'use strict';

import { CSSTechnique, CSSTechniqueResult } from '@qualweb/css-techniques';
import { CSSStylesheet } from '@qualweb/core';
import css from 'css';

import Technique from './Technique.object';

const technique: CSSTechnique = {
  name: 'Using "percent, em, names" for font sizes',
  code: 'QW-CSS-T4',
  mapping: 'C22',
  description: 'The objective of this technique is to demonstrate how CSS can be used to control the visual presentation of text. This will allow users to modify, via the user agent, the visual characteristics of the text to meet their requirement. The text characteristics include aspects such as size, color, font family and relative placement.',
  metadata: {
    target: {
      element: '*',
      attributes: 'font-size'
    },
    'success-criteria': [{
        name: '1.3.1',
        level: 'A',
        principle: 'Perceivable',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships'
      },
      {
        name: '1.4.4',
        level: 'AA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/resize-text'
      },
      {
        name: '1.4.5',
        level: 'AA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/images-of-text'
      },
      {
        name: '1.4.9	',
        level: 'AAA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/images-of-text-no-exception'
      }
    ],
    related: [],
    url: {
      'C8' : 'https://www.w3.org/WAI/WCAG21/Techniques/css/C8',
      'C12': 'https://www.w3.org/WAI/WCAG21/Techniques/css/C12',
      'C13': 'https://www.w3.org/WAI/WCAG21/Techniques/css/C13',
      'C14': 'https://www.w3.org/WAI/WCAG21/Techniques/css/C14',
      'C21': 'https://www.w3.org/WAI/WCAG21/Techniques/css/C21',
      'SCR34' : 'https://www.w3.org/WAI/WCAG21/Techniques/client-side-script/SCR34'
    },
    passed: 0,
    warning: 0,
    failed: 0,
    inapplicable: 0,
    outcome: '',
    description: ''
  },
  results: new Array<CSSTechniqueResult>()
};

class QW_CSS_T4 extends Technique {

  constructor() {
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
  analyseAST(cssObject: any, fileName: string): void {
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
  
  loopDeclarations(cssObject: any, fileName: string): void {
  
    let declarations = cssObject['declarations'];
    if(declarations){
      for (const declaration of declarations || []) {
        if (declaration['property'] && declaration['value'] ) {
            this.extractInfo(cssObject, declaration, fileName);
        }
      }
    }
  }
  
  extractInfo(cssObject: any, declaration: any, fileName: string): void {
    const names = ['font-family', 'text-align', 'font-size',
    'font-style', 'font-weight', 'color', 'line-height', 'text-transform', 'letter-spacing',
    'background-image', 'first-line', ':first-letter', ':before', ':after'];
  
    if(names.includes(declaration['property'])){
      super.fillEvaluation('passed', `Element uses CSS properties were used to control the visual presentation of text`,
        css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
        fileName, cssObject['selectors'] ? cssObject['selectors'].toString() : '', cssObject['position'],
        declaration['property'], declaration['value'], declaration['position'])
  
    } else {
      super.fillEvaluation('inapplicable', `Element doesn't uses CSS properties were used to control the visual presentation of text`)
    }
  }

}


export = QW_CSS_T4;