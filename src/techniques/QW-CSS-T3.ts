'use strict';

import { CSSStylesheet } from '@qualweb/core';
import css from 'css';
import { CssUtils } from '@qualweb/util';
import Technique from '../lib/Technique.object';
import { CSSTechnique } from '../lib/decorator';

@CSSTechnique
class QW_CSS_T3 extends Technique {

  constructor(technique?: any) {
    super(technique);
  }

  async execute(styleSheets: CSSStylesheet[]): Promise<void> {
    for (const styleSheet of styleSheets || []) {
      if (styleSheet.content && styleSheet.content.plain) {
        if (styleSheet.content.plain.includes('line-height')) {
          this.analyseAST(styleSheet.content.parsed, styleSheet.file);
        }
      }
    }
  }

  private analyseAST(cssObject: any, fileName: string): void {
    if (cssObject === undefined ||
      cssObject['type'] === 'comment' ||
      cssObject['type'] === 'keyframes' ||
      cssObject['type'] === 'import') { // ignore
      return;
    }
    if (cssObject['type'] === 'rule' || cssObject['type'] === 'font-face' || cssObject['type'] === 'page') {
      if (cssObject['selectors'])
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
    let declarations = cssObject['declarations'];
    if (declarations) {
      for (const declaration of declarations || []) {
        if (declaration['property'] && declaration['value']) {
          if (declaration['property'] === 'line-height') {
            this.extractInfo(cssObject, declaration, fileName);
          }
        }
      }
    }
  }

  private extractInfo(cssObject: any, declaration: any, fileName: string): void {
    if (CssUtils.trimImportant(declaration['value']) === "normal") {
      super.fillEvaluation('RC1', 'failed', `Text block doesn't have line spacing between 150% and 200%.`,
        css.stringify({ type: 'stylesheet', stylesheet: { rules: [cssObject] } }),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);
    } else if (CssUtils.trimImportant(declaration['value']).endsWith('%')) {
      let number = +declaration['value'].replace('%', '');
      if (number >= 150 && number <= 200) {
        super.fillEvaluation('RC2', 'passed', `Text block has line spacing between 150% and 200%`,
          css.stringify({ type: 'stylesheet', stylesheet: { rules: [cssObject] } }),
          fileName, cssObject['selectors'].toString(), cssObject['position'],
          declaration['property'], declaration['value'], declaration['position']);
      } else {
        super.fillEvaluation('RC3', 'failed', `Text block doesn't have line spacing between 150% and 200%.`,
          css.stringify({ type: 'stylesheet', stylesheet: { rules: [cssObject] } }),
          fileName, cssObject['selectors'].toString(), cssObject['position'],
          declaration['property'], declaration['value'], declaration['position']);
      }
    } else if (/\d$/.test(declaration['value'])) {
      if (+declaration['value'] >= 1.5 && +declaration['value'] <= 2) {
        super.fillEvaluation('RC4', 'passed', `Text block has line spacing between 150% and 200%`,
          css.stringify({ type: 'stylesheet', stylesheet: { rules: [cssObject] } }),
          fileName, cssObject['selectors'].toString(), cssObject['position'],
          declaration['property'], declaration['value'], declaration['position']);
      } else {
        super.fillEvaluation('RC5', 'failed', `Text block doesn't have line spacing between 150% and 200%.`,
          css.stringify({ type: 'stylesheet', stylesheet: { rules: [cssObject] } }),
          fileName, cssObject['selectors'].toString(), cssObject['position'],
          declaration['property'], declaration['value'], declaration['position']);
      }
    } else if (/\d/.test(declaration['value'])) {//length
      super.fillEvaluation('RC6', 'warning', ` Check if text block has line spacing between 150% and 200%.`,
        css.stringify({ type: 'stylesheet', stylesheet: { rules: [cssObject] } }),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);
    } else {
      super.fillEvaluation('RC7', 'inapplicable', `Text block line-height property isn't percentage.`,
        css.stringify({ type: 'stylesheet', stylesheet: { rules: [cssObject] } }),
        fileName, cssObject['selectors'].toString(), cssObject['position'],
        declaration['property'], declaration['value'], declaration['position']);
    }
  }
}

export = QW_CSS_T3;
