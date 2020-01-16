# QualWeb CSS techniques

## How to install

```shell
  $ npm i @qualweb/css-techniques --save
```

## How to run

### Additional packages

```shell
  $ npm i puppeteer css stew-select htmlparser2 request --save
```

```javascript
  'use strict';

  const puppeteer = require('puppeteer');
  const css = require('css');
  const htmlparser2 = require('htmlparser2');
  const request = require('request');
  const stew = new (require('stew-select')).Stew();
  const { executeCSST } = require('@qualweb/css-techniques');

  const DEFAULT_DESKTOP_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:22.0) Gecko/20100101 Firefox/22.0';
  const DEFAULT_MOBILE_USER_AGENT = 'Mozilla/5.0 (Linux; U; Android 2.2; en-us; DROID2 GLOBAL Build/S273) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1';
  const DEFAULT_DESKTOP_PAGE_VIEWPORT_WIDTH = 1366;
  const DEFAULT_DESKTOP_PAGE_VIEWPORT_HEIGHT = 768;
  const DEFAULT_MOBILE_PAGE_VIEWPORT_WIDTH = 1080;
  const DEFAULT_MOBILE_PAGE_VIEWPORT_HEIGHT = 1920;

  async function parseStylesheets(plainStylesheets) {
    const stylesheets = new Array();
    for (const file in plainStylesheets || {}){
      const stylesheet = { file, content: {} };
      if (stylesheet.content) {
        stylesheet.content.plain = plainStylesheets[file];
        stylesheet.content.parsed = css.parse(plainStylesheets[file], { silent: true }); //doesn't throw errors
        stylesheets.push(stylesheet);
      }
    }

    return stylesheets;
  }

  async function getRequestData(headers) {
    return new Promise((resolve, reject) => {
      request(headers, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (!response || response.statusCode !== 200) {
          reject(response.statusCode);
        } else {
          resolve({ response, body });
        }
      });
    });
  }

  async function getSourceHTML(url, options) {
    const headers = {
      'url': url,
      'headers': {
        'User-Agent': options ? options.userAgent ? options.userAgent : options.mobile ? DEFAULT_MOBILE_USER_AGENT : DEFAULT_DESKTOP_USER_AGENT : DEFAULT_DESKTOP_USER_AGENT
      }
    };
    const data = await getRequestData(headers);
    const sourceHTML = data.body.toString().trim();
    const parsedHTML = parseHTML(sourceHTML);
    const elements = stew.select(parsedHTML, '*');
    let title = '';
    const titleElement = stew.select(parsedHTML, 'title');
    if (titleElement.length > 0) {
      title = htmlparser2.DomUtils.getText(titleElement[0]);
    }
    const source = {
      html: {
        plain: sourceHTML,
        parsed: parsedHTML
      },
      elementCount: elements.length,
      title: title !== '' ? title : undefined
    };
    return source;
  }

  function parseHTML(html) {
    let parsed = undefined;
    const handler = new htmlparser2.DomHandler((error, dom) => {
      if (error) {
        throw error;
      }
      else {
        parsed = dom;
      }
    });
    const parser = new htmlparser2.Parser(handler);
    parser.write(html.replace(/(\r\n|\n|\r|\t)/gm, ''));
    parser.end();
    if (!parsed) {
      throw new Error('Failed to parse html');
    }
    return parsed;
  }

  async function mapCSSElements(dom, styleSheets, mappedDOM) {
    for (const styleSheet of styleSheets || []) {
      if (styleSheet.content && styleSheet.content.plain) {
        analyseAST(dom, styleSheet.content.parsed, undefined, mappedDOM);
      }
    }
  }

  function analyseAST(dom, cssObject, parentType, mappedDOM) {
    if (cssObject === undefined ||
      cssObject['type'] === 'comment' ||
      cssObject['type'] === 'keyframes' ||
      cssObject['type'] === 'import') {
      return;
    }
    if (cssObject['type'] === 'rule' || cssObject['type'] === 'font-face' || cssObject['type'] === 'page') {
      loopDeclarations(dom, cssObject, parentType, mappedDOM);
    } else {
      if (cssObject['type'] === 'stylesheet') {
        for (const key of cssObject['stylesheet']['rules'] || []) {
          analyseAST(dom, key, undefined, mappedDOM);
        }
      } else {
        for (const key of cssObject['rules'] || []) {
          if (cssObject['type'] && cssObject['type'] === 'media') {
            analyseAST(dom, key, cssObject[cssObject['type']], mappedDOM);
          } else {
            analyseAST(dom, key, undefined, mappedDOM);
          }
        }
      }
    }
  }

  function loopDeclarations(dom, cssObject, parentType, mappedDOM) {
    const declarations = cssObject['declarations'];
    if (declarations && cssObject['selectors'] && !cssObject['selectors'].toString().includes('@-ms-viewport') && !(cssObject['selectors'].toString() === ':focus')) {
      try {
        const stewResult = stew.select(dom, cssObject['selectors'].toString());
        if (stewResult.length > 0) {
          for (const item of stewResult || []) {
            for (const declaration of declarations || []) {
              if (declaration['property'] && declaration['value']) {
                if (!item['attribs'])
                  item['attribs']={}
                if (!item['attribs']['css'])
                  item['attribs']['css'] = {};
                if (item['attribs']['css'][declaration['property']] && item['attribs']['css'][declaration['property']]['value'] &&
                  item['attribs']['css'][declaration['property']]['value'].includes('!important')) {
                  continue;
                } else {
                  item['attribs']['css'][declaration['property']] = {};
                  if (parentType) {
                    item['attribs']['css'][declaration['property']]['media'] = parentType;
                  }
                  item['attribs']['css'][declaration['property']]['value'] = declaration['value'];
                }
                mappedDOM[item['_stew_node_id']] = item;
              }
            }
          }
        }
      }
      catch (err) {
      }
    }
  }

  (async () => {
    const browser = await puppeteer.launch();
    const page = await this.browser.newPage();

    const plainStylesheets: any = {};
    page.on('response', async response => {
      if(response.request().resourceType() === 'stylesheet') {
        const url = response.url();
        const content = await response.text();
        plainStylesheets[url] = content;
      }
    });

    await page.goto('https://act-rules.github.io/pages/about/', {
      waitUntil: ['networkidle2', 'domcontentloaded']
    });
    
    const stylesheets = await parseStylesheets(plainStylesheets);

    const sourceHtml = await getSourceHTML(url);

    const mappedDOM = {};
    const cookedStew = await stew.select(sourceHtml.html.parsed, '*');
    if (cookedStew.length > 0) {
      for (const item of cookedStew || []) {
        mappedDOM[item['_stew_node_id']] = item;
      }
    }

    await mapCSSElements(sourceHtml.html.parsed, stylesheets, mappedDOM);

    const report = await executeCSST(stylesheets, mappedDOM);

    console.log(report);
  })();
```

# License

ISC