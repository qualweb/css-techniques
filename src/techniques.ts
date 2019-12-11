import QW_CSS_T1 from './techniques/QW-CSS-T1';
import QW_CSS_T2 from './techniques/QW-CSS-T2';
import QW_CSS_T3 from './techniques/QW-CSS-T3';
import QW_CSS_T4 from './techniques/QW-CSS-T4';
import QW_CSS_T5 from './techniques/QW-CSS-T5';
import QW_CSS_T6 from './techniques/QW-CSS-T6';
import QW_CSS_T7 from './techniques/QW-CSS-T7';

const techniques = {
  'QW-CSS-T1': new QW_CSS_T1(),
  'QW-CSS-T2': new QW_CSS_T2(),
  'QW-CSS-T3': new QW_CSS_T3(),
  'QW-CSS-T4': new QW_CSS_T4(),
  'QW-CSS-T5': new QW_CSS_T5(),
  'QW-CSS-T6': new QW_CSS_T6(),
  'QW-CSS-T7': new QW_CSS_T7()
};

const techniquesToExecute = {
  'QW-CSS-T1': true,
  'QW-CSS-T2': true,
  'QW-CSS-T3': true,
  'QW-CSS-T4': true,
  'QW-CSS-T5': true,
  'QW-CSS-T6': true,
  'QW-CSS-T7': true
};

export {
  techniques,
  techniquesToExecute
};