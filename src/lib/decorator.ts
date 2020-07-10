import { CSSTechniqueResult } from '@qualweb/css-techniques';
import techniques from './techniques.json';
import cloneDeep from 'lodash.clonedeep';

function CSSTechnique<T extends { new (...args: any[]): {} }>(constructor: T) {
  const technique = techniques[constructor.name];
  
  technique.metadata.passed = 0;
  technique.metadata.warning = 0;
  technique.metadata.failed = 0;
  technique.metadata.outcome = '';
  technique.metadata.description = '';
  technique.results = new Array<CSSTechniqueResult>();
  
  const newConstructor: any = function () {
    const func: any = function () {
      return new constructor(cloneDeep(technique));
    }
    func.prototype = constructor.prototype;
    return new func();
  }
  newConstructor.prototype = constructor.prototype;
  return newConstructor;
}

function ElementExists(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  descriptor.value = function () {
    if (arguments[0]) {
      return method.apply(this, arguments);
    } else {
      return;
    }
  };
}

function ElementIsAContainer(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  descriptor.value = function() {
    const containers = ['span', 'article', 'section', 'nav', 'aside', 'hgroup', 'header', 'footer', 'address', 'p', 'hr', 'blockquote', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ul', 'ol', 'dd', 'dt', 'dl', 'figcaption'];
    if (containers.includes(arguments[0].getElementTagName())) {
      return method.apply(this, arguments);
    }
  };
}

export { 
  CSSTechnique,
  ElementExists,
  ElementIsAContainer
};