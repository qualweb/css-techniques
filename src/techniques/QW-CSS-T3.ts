'use strict';

import _ from 'lodash';

import {CSSTechnique, CSSTechniqueResult} from '@qualweb/css-techniques';
import {CSSStylesheet} from '@qualweb/get-dom-puppeteer';
import css from 'css';

const technique: CSSTechnique = {
  name: 'Specifying line spacing in CSS',
  code: 'QW-CSS-T3',
  mapping: 'C21',
  description: 'Many people with cognitive disabilities have trouble tracking lines of text when a block of text is single spaced. Providing spacing between 1.5 to 2 allows them to start a new line more easily once they have finished the previous one.',
  metadata: {
    target: {
      element: '*',
      attributes: 'line-height'
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
    if (declaration['property'] === 'line-height'){
          extractInfo(cssObject, declaration, fileName);
        }
      }
    }
  }
}

function extractInfo(cssObject: any, declaration: any, fileName: string): void {
  if(declaration['value'].endsWith('%')){
    let number = +declaration['value'].replace("%",);
    if(number >= 150 && number <= 200){
      fillEvaluation('passed', `Text block has line spacing between 150% and 200%`,
      css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
      fileName, cssObject['selectors'].toString(), cssObject['position'],
      declaration['property'], declaration['value'], declaration['position']);
    }else{
      fillEvaluation('failed', `Text block hasn't line spacing between 150% and 200%.`,
      css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
      fileName, cssObject['selectors'].toString(), cssObject['position'],
      declaration['property'], declaration['value'], declaration['position']);
    }
  } else if(typeof +declaration['value'] === "number"){
    if(+declaration['value'] >= 1.5 && +declaration['value'] <= 2){
      fillEvaluation('passed', `Text block has line spacing between 150% and 200%`,
      css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
      fileName, cssObject['selectors'].toString(), cssObject['position'],
      declaration['property'], declaration['value'], declaration['position']);
    }else{
      fillEvaluation('failed', `Text block hasn't line spacing between 150% and 200%.`,
      css.stringify({ type: 'stylesheet', stylesheet:{rules: [cssObject]}}),
      fileName, cssObject['selectors'].toString(), cssObject['position'],
      declaration['property'], declaration['value'], declaration['position']);
    }
  }else {
    fillEvaluation('inapplicable', `Text block line-height property isn't percentage.`,
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