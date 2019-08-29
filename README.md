# QualWeb CSS techniques

## How to install

```shell
  $ npm i @qualweb/css-techniques --save
```

## How to run

### Additional packages

```shell
  $ npm i @qualweb/get-dom-puppeteer --save
```

```javascript
  'use strict';

  const { getDom } = require('@qualweb/get-dom-puppeteer');
  const { executeCSST } = require('@qualweb/css-techniques');

  (async () => {
    const { processed } = await getDom('https://act-rules.github.io/pages/about/');

    const report = await executeCSST(processed.html.parsed);

    console.log(report);
  })();
```

# License

ISC