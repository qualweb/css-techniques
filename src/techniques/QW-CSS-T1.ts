'use strict';

import _ from 'lodash';

import {CSSTechnique, CSSTechniqueResult} from '@qualweb/css-techniques';
import {CSSStylesheet} from '@qualweb/get-dom-puppeteer';

const css = require('css');

const technique: CSSTechnique = {
  name: 'Using "percent, em, names" for font sizes',
  code: 'QW-CSS-T1',
  mapping: 'C121314',
  description: 'This technique checks that all font-size attribute uses percent, em or names',
  metadata: {
    target: {
      element: '*',
      attributes: 'font-size'
    },
    'success-criteria': [{
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
        name: '1.4.8',
        level: 'AAA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation'
      },
      {
        name: '1.4.9',
        level: 'AAA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/images-of-text-no-exception'
      }
    ],
    related: ['C12', 'C13', 'C14'],
    url: {
      'C12': 'https://www.w3.org/WAI/WCAG21/Techniques/css/C12',
      'C13': 'https://www.w3.org/WAI/WCAG21/Techniques/css/C13',
      'C14': 'https://www.w3.org/WAI/WCAG21/Techniques/css/C14'
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
    if (styleSheet.content && styleSheet.content.plain) {
      if (styleSheet.content.plain.includes("font-size")) {
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
  technique.results = new Array<CSSTechniqueResult>();
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
    cssObject['type'] === 'import') { // ignore
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
  if (declarations) {
    for (const declaration of declarations) {
      if (declaration['property'] && declaration['value']) {
        if (declaration['property'] === 'font-size') {
          extractInfo(cssObject, declaration, fileName);
        }
      }
    }
  }
}

function extractInfo(cssObject: any, declaration: any, fileName: string): void {
  const names = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xsmaller', 'larger'];

  if (declaration['value'].includes('px')) {
    fillEvaluation('warning', `Element "font-size" style attribute uses "px"`,
      css.stringify({type: 'stylesheet', stylesheet: {source: undefined, rules: [cssObject]}}),
      fileName, cssObject['selectors'].toString(), cssObject['position'],
      declaration['property'], declaration['value'], declaration['position'])

  } else if (declaration['value'].endsWith('em') || declaration['value'].endsWith('%') || names.includes(declaration['value'].trim()) ) {
    //todo acrescentamos tambem o !important? || declaration['value'].endsWith('em!important') || declaration['value'].endsWith('%!important')
    fillEvaluation('passed', `Element "font-size" style attribute doesn\'t use "px"`,
      css.stringify({type: 'stylesheet', stylesheet: {source: undefined, rules: [cssObject]}}),
      fileName, cssObject['selectors'].toString(), cssObject['position'],
      declaration['property'], declaration['value'], declaration['position']);

  } else {
    //todo inherit eh uma unknown metric... eh suposto?
    //todo damos failed ou inapplicable?
    fillEvaluation('inapplicable', `Element has "font-size" style with unknown metric`,
      css.stringify({type: 'stylesheet', stylesheet: {source: undefined, rules: [cssObject]}}),
      fileName, cssObject['selectors'].toString(), cssObject['position'],
      declaration['property'], declaration['value'], declaration['position']);
  }
}

function fillEvaluation(verdict: "" | "passed" | "failed" | "warning" | "inapplicable", description: string,
                        cssCode?: string, stylesheetFile?: string,
                        selectorValue?: string, selectorPosition?: Position,
                        propertyName?: string, propertyValue?: string, propertyPosition?: Position) {

  const evaluation: CSSTechniqueResult = {
    verdict: verdict,
    description: description
  };

  if (verdict !== 'inapplicable' && selectorValue && propertyName && propertyValue) {
    evaluation.cssCode = cssCode;
    evaluation.stylesheetFile = stylesheetFile;
    evaluation.selector = {value: selectorValue, position: selectorPosition};
    evaluation.property = {name: propertyName, value: propertyValue, "position": propertyPosition};
  }

  technique.metadata[verdict]++;
  technique.results.push(_.clone(evaluation));
}
