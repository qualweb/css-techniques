'use strict';

import { CSSTechniqueResult } from '@qualweb/css-techniques';
import Technique from '../lib/Technique.object';
import { CSSTechnique, ElementExists } from '../lib/decorator';
import { QWElement } from '@qualweb/qw-element';

@CSSTechnique
class QW_CSS_T6 extends Technique {

  constructor(technique?: any) {
    super(technique);
  }

  @ElementExists
  execute(element: QWElement): void {

    const evaluation: CSSTechniqueResult = {
      verdict: '',
      description: '',
      resultCode: ''
    };

    if (element.elementHasAttribute('_cssRules')) {
      const cssRules = element.getCSSRules();

      const property = this.findTextDecorationWithBlink(cssRules);

      if (property !== undefined) {
        evaluation.verdict = 'failed';
        evaluation.description = 'This test target has a `text-decoration` property with the value `blink';
        evaluation.resultCode = 'RC1';
        evaluation.htmlCode = element.getElementHtmlCode(true, true);
        evaluation.pointer = element.getElementSelector();
        evaluation.property = {
          name: 'text-decoration',
          value: 'blink'
        };
        evaluation.stylesheetFile = property.pointer;

        super.addEvaluationResult(evaluation);
      }
    }
  }

  private findTextDecorationWithBlink(properties: any): any {
    for (const property in properties || {}) {
      if (property === 'media') {
        const mediaRule = this.findInMediaRules(properties['media']);
        if (mediaRule !== undefined) {
          return mediaRule;
        }
      } else if (property === 'text-decoration') {
        if (properties[property]['value'] === 'blink') {
          return properties[property];
        }
      }
    }

    return undefined;
  }

  private findInMediaRules(media: any): any {
    for (const condition in media || {}) {
      for (const property in media[condition] || {}) {
        if (property === 'text-decoration') {
          if (media[condition][property]['value'] === 'blink') {
            return media[condition][property];
          }
        }
      }
    }

    return undefined;
  }
}

export = QW_CSS_T6;