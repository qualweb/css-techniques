'use strict';

import {
  CSSTechnique,
  CSSTechniqueResult
} from '@qualweb/css-techniques';
import {
  CSSStylesheet
} from '@qualweb/core';
// import {
//   DomUtils
// } from "@qualweb/util";

// import css from 'css';

import Technique from './Technique.object';

const technique: CSSTechnique = {
  name: 'Failure of Success Criterion 1.4.3, 1.4.6 and 1.4.8 due to specifying foreground colors without specifying background colors or vice versa',
  code: 'QW-CSS-T7',
  mapping: 'F24',
  description: 'Users with vision loss or cognitive, language and learning challenges often prefer specific foreground and background color combinations. In some cases, individuals with low vision will find it much easier to see a Web page that has white text on a black background, and they may have set their user agent to present this contrast. Many user agents make it possible for users to choose a preference about the foreground or background colors they would like to see without overriding all author-specified styles. This makes it possible for users to view pages where colors have not been specified by the author in their preferred color combination.',
  metadata: {
    target: {
      element: '*',
      attributes: 'text-decoration'
    },
    'success-criteria': [{
        name: '1.4.3',
        level: 'AA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum'
      },
      {
        name: '1.4.6',
        level: 'AAA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced'
      },
      {
        name: '1.4.8',
        level: 'AAA',
        principle: 'Perceivable',
        url: 'https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation'
      }
    ],
    related: ['C23', 'C25'],
    url: 'https://www.w3.org/WAI/WCAG21/Techniques/failures/F24',
    passed: 0,
    warning: 0,
    failed: 0,
    inapplicable: 0,
    outcome: '',
    description: ''
  },
  results: new Array < CSSTechniqueResult > ()
};

class QW_CSS_T7 extends Technique {

  constructor() {
    super(technique);
  }

  async execute(styleSheets: CSSStylesheet[], mappedDOM: any): Promise < void > {

    if(mappedDOM){
      let backgroundChecked = {};

      let keys = Object.keys(mappedDOM)

      for(let key of keys || []){
        if(mappedDOM[key])
          if(this.getStyle(mappedDOM[key], "color") || this.getStyle(mappedDOM[key], "text")){
            let parent = this.getParent(mappedDOM, key);
            let hasBGColor = false;
            while(parent && !hasBGColor){
              if(this.getStyle(parent, "background-color") || this.getStyle(parent, "bgcolor")){
                super.fillEvaluation('passed', `Element has color and background-color set`);
                hasBGColor = true;
                backgroundChecked[parent['_stew_node_id']] = true;
              }
              parent = this.getParent(mappedDOM, parent['_stew_node_id']);
            }
            if(!hasBGColor)
              if(mappedDOM[key]['attribs']['css'])
                super.fillEvaluation('failed', `Element has color set but not background-color`,
                                      mappedDOM[key]['attribs']['css']?mappedDOM[key]['attribs']['css']: undefined,
                                      undefined,
                                      mappedDOM[key]['name'],
                                      undefined,
                                      mappedDOM[key]['attribs']['css']["color"]?mappedDOM[key]['attribs']['css']["color"]:mappedDOM[key]['attribs']['css']["text"],
                                      mappedDOM[key]['attribs']['css']["color"]?mappedDOM[key]['attribs']['css']["color"]['value']:mappedDOM[key]['attribs']['css']["text"]['value'],
                                      undefined);
              else
                super.fillEvaluation('failed', `Element has color set but not background-color`,
                        undefined,
                        undefined,
                        mappedDOM[key]['name'],
                        undefined,
                        undefined,
                        undefined,
                        undefined);
          } else if(this.getStyle(mappedDOM[key], "background-color") || this.getStyle(mappedDOM[key], "bgcolor")){
              if(!backgroundChecked.hasOwnProperty(key)){
                backgroundChecked[key] = false;
              }
          }
      }

      keys = Object.keys(backgroundChecked);

      for(let key of keys || []){
        if(!backgroundChecked[key]){
          if(mappedDOM[key]['attribs']['css'])
          super.fillEvaluation('failed', `Element has background-color set but not color`,
                              mappedDOM[key]['attribs']['css'],
                              undefined,
                              mappedDOM[key]['name'],
                              undefined,
                              mappedDOM[key]['attribs']['css']["background-color"]?mappedDOM[key]['attribs']['css']["background-color"]:mappedDOM[key]['attribs']['css']["bgcolor"],
                              mappedDOM[key]['attribs']['css']["background-color"]?mappedDOM[key]['attribs']['css']["background-color"]['value']:mappedDOM[key]['attribs']['css']["bgcolor"]['value'],
                              undefined);
              else
                super.fillEvaluation('failed', `Element has color set but not background-color`,
                                      undefined,
                                      undefined,
                                      mappedDOM[key]['name'],
                                      undefined,
                                      undefined,
                                      undefined,
                                      undefined);
        }
      }
    }
  }

  private getStyle(element: Object, property: string): string | undefined{

    if(element['attribs']['css'] && element['attribs']['css'][property])
      return element['attribs']['css'][property]['value'];
    else
      return undefined;
  }

  private getParent(mappedDOM:any, myID: string): Object | undefined{

    if(mappedDOM[myID]['parent']){
      let parentID = mappedDOM[myID]['parent']['_stew_node_id'];
      if(mappedDOM.hasOwnProperty(parentID))
        return mappedDOM[parentID];
    }
    return undefined;
  }
}

export = QW_CSS_T7;