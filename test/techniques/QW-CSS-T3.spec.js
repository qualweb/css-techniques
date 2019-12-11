const {
  configure,
  executeCSST
} = require('../../dist/index');
const {expect} = require('chai');

const puppeteer = require('puppeteer');
const { getDom } = require('../getDom');

describe('Technique QW-CSS-T3', function () {
  const tests = [
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~aestriga/testeCSS-T3/teste1.html',
      outcome: 'failed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~aestriga/testeCSS-T3/teste2.html',
      outcome: 'passed'
    }, 
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~aestriga/testeCSS-T3/teste3.html',
      outcome: 'failed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~aestriga/testeCSS-T3/teste4.html',
      outcome: 'passed'
    }
  ];
  let browser;
  it("pup open", async function () {
    browser = await puppeteer.launch();
  });
  let i = 0;
  let lastOutcome = 'inapplicable';
  for (const test of tests || []) {
    if (test.outcome !== lastOutcome) {
      lastOutcome = test.outcome;
      i = 0;
    }
    i++;
    describe(`${test.outcome.charAt(0).toUpperCase() + test.outcome.slice(1)} example ${i}`, function () {
      it(`should have outcome="${test.outcome}"`, async function () {
        this.timeout(10 * 1000);
        const {stylesheets} = await getDom(browser,test.url);
        const report = await executeCSST(stylesheets);
        expect(report.techniques['QW-CSS-T3'].metadata.outcome).to.be.equal(test.outcome);
      });
    });
  }
  describe(``,  function () {
    it(`pup shutdown`, async function () {
      await browser.close();
    });
  });
});
