'use strict';

import _ from 'lodash';

import {CSSTechnique, CSSTechniqueResult} from '@qualweb/css-techniques';
import {CSSStylesheet} from '@qualweb/get-dom-puppeteer';
import css from 'css';

const technique: CSSTechnique = {
  name: 'Specifying alignment either to the left OR right in CSS',
  code: 'QW-CSS-T2',
  mapping: 'C19',
  description: 'This technique describes how to align blocks of text either left or right by setting the CSS text-align property.',
  metadata: {
    target: {
      element: '*',
      attributes: 'text-align'
    },
    'success-criteria': [
      {
        name: '1.4.8',
        level: 'AAA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-visual-presentation.html'
      }
    ],
    related: [],
    url: {},
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
    
    if(cssObject['selectors'])
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
        if (declaration['property'] === 'text-align'){
          extractInfo(cssObject, declaration, fileName);
        }else{
          fillEvaluation('failed', `Text block doesn't have alignment property.`,
            css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
            fileName, cssObject['selectors'].toString(), cssObject['position'],
            declaration['property'], declaration['value'], declaration['position']);
        }
      }
    }
  }
}

function extractInfo(cssObject: any, declaration: any, fileName: string): void {

  if(declaration['value'].includes('left') || declaration['value'].includes('right')){
    fillEvaluation('passed', `Text block is aligned either left or right.`,
      css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
      fileName, cssObject['selectors'].toString(), cssObject['position'],
      declaration['property'], declaration['value'], declaration['position']);

  } else {
    fillEvaluation('failed', `Text block is not aligned either left nor right.`,
      css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
      fileName, cssObject['selectors'].toString(), cssObject['position'],
      declaration['property'], declaration['value'], declaration['position']);
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
