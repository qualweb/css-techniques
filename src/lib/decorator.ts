'use strict';

import { CSSTechniqueResult } from '@qualweb/css-techniques';
import techniques from './techniques.json';

function CSSTechnique<T extends { new (...args: any[]): {} }>(constructor: T) {
  const technique = techniques[constructor.name];
  
  technique.metadata.passed = 0;
  technique.metadata.warning = 0;
  technique.metadata.failed = 0;
  technique.metadata.outcome = '';
  technique.metadata.description = '';
  technique.results = new Array<CSSTechniqueResult>();
  
  const newConstructor: any = function () {
    let func: any = function () {
      return new constructor(technique);
    }
    func.prototype = constructor.prototype;
    return new func();
  }
  newConstructor.prototype = constructor.prototype;
  return newConstructor;
}

export { 
  CSSTechnique
};