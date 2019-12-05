const {
  configure,
  executeCSST
} = require('../../dist/index');
const {expect} = require('chai');
const puppeteer = require('puppeteer');
const {getDom} = require('../getDom');

describe('Technique QW-CSS-T9', function () {
  const tests = [
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css9/textAlignLeft.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css9/textAlignJustifyTextJustifyNone.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css9/textAlignJustify.html',
      outcome: 'failed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css9/textAlignJustifyTextJustify.html',
      outcome: 'failed'
    }
  ];

  let browser;
  it("", async function () {
    browser = await puppeteer.launch();
  });
  let i = 0;
  let lastOutcome = 'passed';
  for (const test of tests || []) {
    if (test.outcome !== lastOutcome) {
      lastOutcome = test.outcome;
      i = 0;
    }
    i++;
    describe(`${test.outcome.charAt(0).toUpperCase() + test.outcome.slice(1)} example ${i}`, function () {
      it(`should have outcome="${test.outcome}"`, async function () {
        this.timeout(100 * 1000);
        const { stylesheets } = await getDom(browser, test.url);
        //configure({ techniques: ['QW-CSS-T9'] });
        const report = await executeCSST(stylesheets);

        expect(report.techniques['QW-CSS-T9'].metadata.outcome).to.be.equal(test.outcome);
      });
    });
  }

  describe(``, async function () {
    it(``, async function () {
      await browser.close();
    });
  });
});
