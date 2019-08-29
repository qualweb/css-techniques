'use strict';

import _ from 'lodash';
import {
  DomElement
} from 'htmlparser2';

import {
  CSSTechnique,
  CSSTechniqueResult
} from '@qualweb/css-techniques';

import {
  getElementSelector,
  transform_element_into_html
} from '../util';

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
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-scale.html'
      },
      {
        name: '1.4.5',
        level: 'AA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-text-presentation.html'
      },
      {
        name: '1.4.8',
        level: 'AAA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-visual-presentation.html'
      },
      {
        name: '1.4.9	',
        level: 'AAA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/WAI/GL/UNDERSTANDING-WCAG20/visual-audio-contrast-text-images.html'
      }
    ],
    related: ['C12', 'C13', 'C14'],
    url: {
      'C12': 'https://www.w3.org/TR/WCAG20-TECHS/C12.html',
      'C13': 'https://www.w3.org/TR/WCAG20-TECHS/C13.html',
      'C14': 'https://www.w3.org/TR/WCAG20-TECHS/C14.html'
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

async function execute(element: DomElement | undefined, processedHTML: DomElement[]): Promise<void> {

  if (!element) {
    return;
  }

  const evaluation: CSSTechniqueResult = {
    verdict: '',
    description: ''
  };

  if (element.attribs && element.attribs['computed-style']) {
    const cStyle = element.attribs['computed-style'];
    const styles = cStyle.split(';');

    const names = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'xsmaller', 'larger'];

    let styleFound = false;

    for (const style of styles || []) {
      if (style.trim().startsWith('font-size')) {
        styleFound = true;
        const fontSize = style.trim().split(':');
        const value = fontSize[1].trim();

        if (names.includes(value)) {
          evaluation.verdict = 'passed';
          evaluation.description = `Element "font-size" style attribute doesn't use "px"`;
          technique.metadata.passed++;
        } else if (value.endsWith('%')) {
          evaluation.verdict = 'passed';
          evaluation.description = `Element "font-size" style attribute doesn't use "px"`;
          technique.metadata.passed++;
        } else if (value.endsWith('em')) {
          evaluation.verdict = 'passed';
          evaluation.description = `Element "font-size" style attribute doesn't use "px"`;
          technique.metadata.passed++;
        } else {
          evaluation.verdict = 'failed';
          evaluation.description = `Element "font-size" style attribute uses "px"`;
          technique.metadata.failed++;
        }

        evaluation.attributes = style.trim();
      }
    }

    if (!styleFound) {
      evaluation.verdict = 'inapplicable';
      evaluation.description = `Element doesn't have the style "font-size"`;
      technique.metadata.inapplicable++;
    }
  } else {
    evaluation.verdict = 'inapplicable';
    evaluation.description = `Element doesn't have styles`;
    technique.metadata.inapplicable++;
  }

  if (element) {
    evaluation.code = transform_element_into_html(element);
    evaluation.pointer = getElementSelector(element);
  }

  technique.results.push(_.clone(evaluation));
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