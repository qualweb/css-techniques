'use strict';

import { CSSStylesheet } from '@qualweb/core';
import Technique from '../lib/Technique.object';
import { CSSTechnique } from '../lib/decorator';

@CSSTechnique
class QW_CSS_T7 extends Technique {

  constructor(technique?: any) {
    super(technique);
  }

  async execute(styleSheets: CSSStylesheet[], mappedDOM: any): Promise<void> {
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
                backgroundChecked[parent['startIndex']] = true;
              }
              parent = this.getParent(mappedDOM, parent['startIndex']);
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
      let parentID = mappedDOM[myID]['parent']['startIndex'];
      if(mappedDOM.hasOwnProperty(parentID))
        return mappedDOM[parentID];
    }
    return undefined;
  }
}

export = QW_CSS_T7;