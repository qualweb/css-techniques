const {
  configure,
  executeCSST
} = require('../../dist/index');
const {expect} = require('chai');

const puppeteer = require('puppeteer');
const { getDom } = require('../getDom');

describe('Technique QW-CSS-T4', function () {
  const tests = [
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t1.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t2.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t3.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t4.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t5.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t6.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t7.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t8.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t9.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t10.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t11.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/T4/t12.html',
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

        configure({
          techniques: ["QW-CSS-T4"]
        });

        const report = await executeCSST(stylesheets);
        expect(report.techniques['QW-CSS-T4'].metadata.outcome).to.be.equal(test.outcome);
      });
    });
  }
  describe(``,  function () {
    it(`pup shutdown`, async function () {
      await browser.close();
    });
  });
});
