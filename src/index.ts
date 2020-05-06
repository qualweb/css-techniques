'use strict';

import { CSSTOptions, CSSTechniquesReport } from '@qualweb/css-techniques';
import { CSSStylesheet } from '@qualweb/core';

import * as techniques from './lib/techniques';

class CSSTechniques {

  private techniques: any;

  private techniquesToExecute: any;

  constructor(options?: CSSTOptions) {
    this.techniques = {};
    this.techniquesToExecute = {};

    for(const technique of Object.keys(techniques) || []) {
      const _technique = technique.replace(/_/g, '-');
      this.techniques[_technique] = new techniques[technique]();
      this.techniquesToExecute[_technique] = true;
    }

    if (options) {
      this.configure(options);
    }
  }

  public configure(options: CSSTOptions): void {
    this.resetConfiguration();
    
    if (options.principles) {
      options.principles = options.principles.map(p => (p.charAt(0).toUpperCase() + p.toLowerCase().slice(1)).trim());
    }
    if (options.levels) {
      options.levels = options.levels.map(l => l.toUpperCase().trim());
    }
    if (options.techniques) {
      options.techniques = options.techniques.map(t => t.toUpperCase().trim());
    }

    for (const technique of Object.keys(this.techniques) || []) {
      this.techniquesToExecute[technique] = true;

      if (options.principles && options.principles.length !== 0) {
        if (options.levels && options.levels.length !== 0) {
          if (!this.techniques[technique].hasPrincipleAndLevels(options.principles, options.levels)) {
            this.techniquesToExecute[technique] = false;
          }
        } else if (!this.techniques[technique].hasPrincipleAndLevels(options.principles, ['A', 'AA', 'AAA'])) {
          this.techniquesToExecute[technique] = false;
        }
      } else if (options.levels && options.levels.length !== 0) {
        if (!this.techniques[technique].hasPrincipleAndLevels(['Perceivable', 'Operable', 'Understandable', 'Robust'], options.levels)) {
          this.techniquesToExecute[technique] = false;
        }
      }
      if (!options.principles && !options.levels) {
        if (options.techniques && options.techniques.length !== 0) {
          if (!options.techniques.includes(technique) && !options.techniques.includes(this.techniques[technique].getTechniqueMapping())) {
            this.techniquesToExecute[technique] = false;
          } else {
            this.techniquesToExecute[technique] = true;
          }
        }
      } else {
        if (options.techniques && options.techniques.length !== 0) {
          if (options.techniques.includes(technique) || options.techniques.includes(this.techniques[technique].getTechniqueMapping())) {
            this.techniquesToExecute[technique] = true;
          }
        }
      }
    }
  }

  public resetConfiguration(): void {
    for (const technique in this.techniquesToExecute || {}) {
      this.techniquesToExecute[technique] = true;
    }
  }

  private async executeTechnique(report: CSSTechniquesReport, technique: string, styleSheets: CSSStylesheet[], mappedDOM: any): Promise<void> {
    try {
      await this.techniques[technique].execute(styleSheets, mappedDOM);
      report.assertions[technique] = this.techniques[technique].getFinalResults();
      report.metadata[report.assertions[technique].metadata.outcome]++;
      this.techniques[technique].reset();
    } catch(err) {
      console.error(err);
    }
  }

  private async executeTechniques(report: CSSTechniquesReport, styleSheets: CSSStylesheet[], mappedDOM: any): Promise<void> {
    const promises = new Array<any>();
    for (const technique in this.techniques || {}) {
      if (this.techniquesToExecute[technique]) {
        promises.push(this.executeTechnique(report, technique, styleSheets, mappedDOM));
      }
    }
    await Promise.all(promises);
  }

  public async execute(styleSheets: CSSStylesheet[], mappedDOM: any): Promise<CSSTechniquesReport> {

    const report: CSSTechniquesReport = {
      type: 'css-techniques',
      metadata: {
        passed: 0,
        warning: 0,
        failed: 0,
        inapplicable: 0
      },
      assertions: {}
    };

    await this.executeTechniques(report, styleSheets, mappedDOM);

    return report;
  }
}

export {
  CSSTechniques
};