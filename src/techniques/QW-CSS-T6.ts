'use strict';

import _ from 'lodash';

import {CSSTechnique, CSSTechniqueResult} from '@qualweb/css-techniques';
import {CSSStylesheet} from '@qualweb/get-dom-puppeteer';
import css from 'css';

const technique: CSSTechnique = {
  name: 'Failure of Success Criterion 2.2.2 due to using text-decoration:blink without a mechanism to stop it in less than five seconds',
  code: 'QW-CSS-T6',
  mapping: 'F4',
  description: 'CSS defines the blink value for the text-decoration property. When used, it causes any text in elements with this property to blink at a predetermined rate. This cannot be interrupted by the user, nor can it be disabled as a user agent preference. The blinking continues as long as the page is displayed. Therefore, content that uses text-decoration:blink fails the Success Criterion because blinking can continue for more than three seconds.',
  metadata: {
    target: {
      element: '*',
      attributes: 'text-decoration'
    },
    'success-criteria': [{
      name: '2.2.2',
      level: 'A',
      principle: 'Operable',
      url: 'https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html'
    }
    ],
    related: ['SCR22'],
    url: {
      'SCR22': 'https://www.w3.org/WAI/WCAG21/Techniques/client-side-script/SCR22'
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
      if (styleSheet.content.plain.includes("text-decoration")){
        analyseAST(styleSheet.content.parsed, styleSheet.file);
      }
    }
  }

  if(technique.metadata.failed === 0){
    fillEvaluation("passed", "Didn't find any text-decoration:blink properties")
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
    if (declaration['property'] === 'text-decoration'){
          extractInfo(cssObject, declaration, fileName);
        }
      }
    }
  }
}

function extractInfo(cssObject: any, declaration: any, fileName: string): void {
  if(declaration['value'] === 'blink'){
      fillEvaluation('failed', `Element has the property text-decoration:blink.`,
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