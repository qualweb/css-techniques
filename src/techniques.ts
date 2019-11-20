import * as QW_CSS_T1 from './techniques/QW-CSS-T1';
import * as QW_CSS_T2 from './techniques/QW-CSS-T2';
import * as QW_CSS_T3 from './techniques/QW-CSS-T3';
import * as QW_CSS_T6 from './techniques/QW-CSS-T6';

const techniques = {
  'QW-CSS-T1': QW_CSS_T1,
  'QW-CSS-T2': QW_CSS_T2,
  'QW-CSS-T3': QW_CSS_T3,
  'QW-CSS-T6': QW_CSS_T6
};

const techniquesToExecute = {
  'QW-CSS-T1': true,
  'QW-CSS-T2': true,
  'QW-CSS-T3': true,
  'QW-CSS-T6': true
};

export {
  techniques,
  techniquesToExecute
};