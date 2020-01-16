const {
  CSSTechniques
} = require('../../dist/index');
const {expect} = require('chai');
const puppeteer = require('puppeteer');
const { getDom } = require('../getDom');
// const {getDom} = require('@qualweb/get-dom-puppeteer');
describe('Technique QW-CSS-T7', function () {
  const tests = [
    {
      url: 'https://accessible-serv.lasige.di.fc.ul.pt/~asantos/CSSTest-F24/test1.html',
      outcome: 'failed'
    },
    {
      url: 'https://accessible-serv.lasige.di.fc.ul.pt/~asantos/CSSTest-F24/test2.html',
      outcome: 'failed'
    },
    {
      url: 'https://accessible-serv.lasige.di.fc.ul.pt/~asantos/CSSTest-F24/test3.html',
      outcome: 'failed'
    },
    {
      url: 'https://accessible-serv.lasige.di.fc.ul.pt/~asantos/CSSTest-F24/test4.html',
      outcome: 'failed'
    },
    {
      url: 'https://accessible-serv.lasige.di.fc.ul.pt/~asantos/CSSTest-F24/test5.html',
      outcome: 'failed'
    },
    {
      url: 'https://accessible-serv.lasige.di.fc.ul.pt/~asantos/CSSTest-F24/test6.html',
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
        // const {stylesheets, mappedDOM} = await getDom(test.url);
        const {stylesheets, mappedDOM} = await getDom(browser,test.url);

        const cssTechniques = new CSSTechniques({
          techniques: ["QW-CSS-T7"]
        });

        const report = await cssTechniques.execute(stylesheets);
        expect(report.techniques['QW-CSS-T7'].metadata.outcome).to.be.equal(test.outcome);
      });
    });
  }
  describe(``,  function () {
    it(`pup shutdown`, async function () {
      await browser.close();
    });
  });
});