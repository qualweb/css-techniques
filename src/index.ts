/**
 * 
 */
'use strict';


import { CSSTOptions, CSSTechniquesReport } from '@qualweb/css-techniques';
import {CSSStylesheet} from '@qualweb/get-dom-puppeteer';
// const stew = new(require('stew-select')).Stew();

// import mapping from './techniques/mapping.json';

import { techniques, techniquesToExecute } from './techniques';

function configure(options: CSSTOptions): void {
  if (options.principles) {
    options.principles = options.principles.map(p => (p.charAt(0).toUpperCase() + p.toLowerCase().slice(1)).trim());
  }
  if (options.levels) {
    options.levels = options.levels.map(l => l.toUpperCase().trim());
  }
  if (options.techniques) {
    options.techniques = options.techniques.map(t => t.toUpperCase().trim());
  }

  for (const technique of Object.keys(techniques) || []) {
    techniquesToExecute[technique] = true;

    if (options.principles && options.principles.length !== 0) {
      if (options.levels && options.levels.length !== 0) {
        if (!techniques[technique].hasPrincipleAndLevels(options.principles, options.levels)) {
          techniquesToExecute[technique] = false;
        }
      } else if (!techniques[technique].hasPrincipleAndLevels(options.principles, ['A', 'AA', 'AAA'])) {
        techniquesToExecute[technique] = false;
      }
    } else if (options.levels && options.levels.length !== 0) {
      if (!techniques[technique].hasPrincipleAndLevels(['Perceivable', 'Operable', 'Understandable', 'Robust'], options.levels)) {
        techniquesToExecute[technique] = false;
      }
    }
    if (!options.principles && !options.levels) {
      if (options.techniques && options.techniques.length !== 0) {
        if (!options.techniques.includes(technique) && !options.techniques.includes(technique[technique].getTechniqueMapping())) {
          techniquesToExecute[technique] = false;
        }
      }
    } else {
      if (options.techniques && options.techniques.length !== 0) {
        if (options.techniques.includes(technique) || options.techniques.includes(technique[technique].getTechniqueMapping())) {
          techniquesToExecute[technique] = true;
        }
      }
    }
  }
}

async function executeCSST(styleSheets: CSSStylesheet[]): Promise<CSSTechniquesReport> {
  
  const report: CSSTechniquesReport = {
    type: 'css-techniques',
    metadata: {
      passed: 0,
      warning: 0,
      failed: 0,
      inapplicable: 0
    },
    techniques: {}
  };

  // const selectors = Object.keys(mapping);
  
  // for (const selector of selectors || []) {
  //   for (const technique of mapping[selector] || []) {
  //     if (techniquesToExecute[technique]) {        
  //       let elements = stew.select(processedHTML, selector);
  //       if (elements.length > 0) {
  //         for (const elem of elements || []) {
  //           await techniques[technique].execute(elem, processedHTML);
  //         }
  //       } else {
  //         await techniques[technique].execute(undefined, processedHTML);
  //       }
  //       report.techniques[technique] = techniques[technique].getFinalResults();
  //       report.metadata[report.techniques[technique].metadata.outcome]++;
  //       techniques[technique].reset();
  //     }
  //   }
  // }
  techniques["QW-CSS-T1"].reset();
  await techniques["QW-CSS-T1"].execute(styleSheets);
  report.techniques["QW-CSS-T1"] = techniques["QW-CSS-T1"].getFinalResults();
  report.metadata[report.techniques["QW-CSS-T1"].metadata.outcome]++;

  techniques["QW-CSS-T2"].reset();
  await techniques["QW-CSS-T2"].execute(styleSheets);
  report.techniques["QW-CSS-T2"] = techniques["QW-CSS-T2"].getFinalResults();
  report.metadata[report.techniques["QW-CSS-T2"].metadata.outcome]++;

  techniques["QW-CSS-T3"].reset();
  await techniques["QW-CSS-T3"].execute(styleSheets);
  report.techniques["QW-CSS-T3"] = techniques["QW-CSS-T3"].getFinalResults();
  report.metadata[report.techniques["QW-CSS-T3"].metadata.outcome]++;
  return report;
}

export { configure, executeCSST };