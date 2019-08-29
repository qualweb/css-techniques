/**
 * 
 */
'use strict';

import { DomElement } from 'htmlparser2';
import { CSSTOptions, CSSTechniquesReport } from '@qualweb/css-techniques';
const stew = new(require('stew-select')).Stew();

import mapping from './techniques/mapping.json';

import * as QW_CSS_T1 from './techniques/QW-CSS-T1';

const techniques = {
  'QW-CSS-T1': QW_CSS_T1
};

const techniques_to_execute = {
  'QW-CSS-T1': true
};

function configure(options: CSSTOptions): void {
  if (options.principles) {
    options.principles = options.principles.map(p => (p.charAt(0).toUpperCase() + p.slice(1)).trim());
  }
  if (options.levels) {
    options.levels = options.levels.map(l => l.toUpperCase().trim());
  }
  if (options.techniques) {
    options.techniques = options.techniques.map(t => t.toUpperCase().trim());
  }

  for (const technique of Object.keys(techniques) || []) {
    techniques_to_execute[technique] = true;
    
    if (options.principles && options.principles.length !== 0) {
      if (options.levels && options.levels.length !== 0) {
        if (!techniques[technique].hasPrincipleAndLevels(options.principles, options.levels)) {
          techniques_to_execute[technique] = false;
        }
      } else if (!techniques[technique].hasPrincipleAndLevels(options.principles, ['A', 'AA', 'AAA'])) {
        techniques_to_execute[technique] = false;
      }
    } else if (options.levels && options.levels.length !== 0) {
      if (!techniques[technique].hasPrincipleAndLevels(['Perceivable', 'Operable', 'Understandable', 'Robust'], options.levels)) {
        techniques_to_execute[technique] = false;
      }
    }
    if (!options.principles && !options.levels) {
      if (options.techniques && options.techniques.length !== 0) {
        if (!options.techniques.includes(technique) && !options.techniques.includes(technique[technique].getTechniqueMapping())) {
          techniques_to_execute[technique] = false;
        }
      }
    } else {
      if (options.techniques && options.techniques.length !== 0) {
        if (options.techniques.includes(technique) || options.techniques.includes(technique[technique].getTechniqueMapping())) {
          techniques_to_execute[technique] = true;
        }
      }
    }
  }
}

async function executeCSST(processedHTML: DomElement[]): Promise<CSSTechniquesReport> {
  
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

  const selectors = Object.keys(mapping);
  
  for (const selector of selectors || []) {
    for (const technique of mapping[selector] || []) {
      if (techniques_to_execute[technique]) {        
        let elements = stew.select(processedHTML, selector);
        if (elements.length > 0) {
          for (const elem of elements || []) {
            await techniques[technique].execute(elem, processedHTML);
          }
        } else {
          await techniques[technique].execute(undefined, processedHTML);
        }
        report.techniques[technique] = techniques[technique].getFinalResults();
        report.metadata[report.techniques[technique].metadata.outcome]++;
        techniques[technique].reset();
      }
    }
  }

  return report;
}

export { configure, executeCSST };