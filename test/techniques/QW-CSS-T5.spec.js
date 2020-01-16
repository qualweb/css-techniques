const {
  CSSTechniques
} = require('../../dist/index');
const {expect} = require('chai');

const puppeteer = require('puppeteer');
const { getDom } = require('../getDom');

describe('Technique QW-CSS-T5', function () {
  const tests = [
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T5/t1.html',
      outcome: 'warning'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T5/t2.html',
      outcome: 'failed'
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

        const cssTechniques = new CSSTechniques({
          techniques: ["QW-CSS-T5"]
        });

        const report = await cssTechniques.execute(stylesheets);
        expect(report.techniques['QW-CSS-T5'].metadata.outcome).to.be.equal(test.outcome);
      });
    });
  }
  describe(``,  function () {
    it(`pup shutdown`, async function () {
      await browser.close();
    });
  });
});
