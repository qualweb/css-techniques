'use strict';

import _ from 'lodash';

import {CSSTechnique, CSSTechniqueResult} from '@qualweb/css-techniques';
import {CSSStylesheet} from '@qualweb/get-dom-puppeteer';
import css from 'css';

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

function getTechniqueMapping(): string {
  return technique.mapping;
}

function hasPrincipleAndLevels(principles: string[], levels: string[]): boolean {
  let has = false;
  for (let sc of technique.metadata['success-criteria'] || []) {
    if (principles.includes(sc.principle) && levels.includes(sc.level)) {
      has = true;
    }
  }
  return has;
}

async function execute(styleSheets: CSSStylesheet[]): Promise<void> {

  for (const styleSheet of styleSheets) {
    if(styleSheet.content && styleSheet.content.plain){
      if (styleSheet.content.plain.includes("font-size")){
        analyseAST(styleSheet.content.parsed, styleSheet.file);
      }
    }
  }
}

function getFinalResults() {
  outcomeTechnique();
  return _.cloneDeep(technique);
}

function reset(): void {
  technique.metadata.passed = 0;
  technique.metadata.warning = 0;
  technique.metadata.failed = 0;
  technique.metadata.inapplicable = 0;
  technique.results = new Array < CSSTechniqueResult > ();
}

function outcomeTechnique(): void {
  if (technique.metadata.failed > 0) {
    technique.metadata.outcome = 'failed';
  } else if (technique.metadata.warning > 0) {
    technique.metadata.outcome = 'warning';
  } else if (technique.metadata.passed > 0) {
    technique.metadata.outcome = 'passed';
  } else {
    technique.metadata.outcome = 'inapplicable';
  }

  if (technique.results.length > 0) {
    addDescription();
  }
}

function addDescription(): void {
  for (const result of technique.results || []) {
    if (result.verdict === technique.metadata.outcome) {
      technique.metadata.description = result.description;
      break;
    }
  }
}

export {
  getTechniqueMapping,
  hasPrincipleAndLevels,
  execute,
  getFinalResults,
  reset
};


function analyseAST(cssObject: any, fileName: string): void {
  if (cssObject === undefined ||
    cssObject['type'] === 'comment' ||
    cssObject['type'] === 'keyframes' ||
    cssObject['type'] === 'import'){ // ignore
    return;
  }
  if (cssObject['type'] === 'rule' || cssObject['type'] === 'font-face' || cssObject['type'] === 'page') {
    loopDeclarations(cssObject, fileName)
  } else {
    if (cssObject['type'] === 'stylesheet') {
      for (const key of cssObject['stylesheet']['rules']) {
        analyseAST(key, fileName);
      }
    } else {
      for (const key of cssObject['rules']) {
        analyseAST(key, fileName);
      }
    }
  }
}

function loopDeclarations(cssObject: any, fileName: string): void {

  let declarations = cssObject['declarations'];
  if(declarations){
    for (const declaration of declarations) {
      if (declaration['property'] && declaration['value'] ) {
          extractInfo(cssObject, declaration, fileName);
      }
    }
  }
}

function extractInfo(cssObject: any, declaration: any, fileName: string): void {
  const names = ['font-family', 'text-align', 'font-size',
  'font-style', 'font-weight', 'color', 'line-height', 'text-transform', 'letter-spacing',
  'background-image', 'first-line', ':first-letter', ':before', ':after'];

  if(names.includes(declaration['property'])){
    fillEvaluation('passed', `Element uses CSS properties were used to control the visual presentation of text`,
      css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
      fileName, cssObject['selectors'].toString(), cssObject['position'],
      declaration['property'], declaration['value'], declaration['position'])

  } else {
    fillEvaluation('inapplicable', `Element has "font-size" style with unknown metric`)
  }
}

function fillEvaluation(verdict: "" | "passed" | "failed" | "warning" | "inapplicable", description: string,
                        cssCode?: string, stylesheetFile?: string,
                        selectorValue?: string, selectorPosition?: css.Position,
                        propertyName?: string, propertyValue?: string, propertyPosition?: css.Position) {

  const evaluation: CSSTechniqueResult = {
    verdict: verdict,
    description: description
  };

  if (verdict !== 'inapplicable' && selectorValue && propertyName && propertyValue){
    evaluation.cssCode = cssCode;
    evaluation.stylesheetFile = stylesheetFile;
    evaluation.selector = {value: selectorValue, position: selectorPosition};
    evaluation.property = {name: propertyName, value: propertyValue, position: propertyPosition};
  }

  technique.metadata[verdict]++;
  technique.results.push(_.clone(evaluation));
}
