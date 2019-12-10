const {
  configure,
  executeCSST
} = require('../../dist/index');
const {expect} = require('chai');

const puppeteer = require('puppeteer');
const { getDom } = require('../getDom');

describe('Technique QW-CSS-T1', function () {
  const tests = [
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css1/em.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css1/emImportant.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css1/emOnlyPElement.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css1/percentage.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css1/larger.html',
      outcome: 'passed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css1/px.html',
      outcome: 'failed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css1/pxImportant.html',
      outcome: 'failed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css1/initial.html',
      outcome: 'failed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css1/pt.html',
      outcome: 'failed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css1/zero.html',
      outcome: 'failed'
    },
    {
      url: 'http://accessible-serv.lasige.di.fc.ul.pt/~bandrade/css1/larg.html',
      outcome: 'failed'
    },
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

        // configure({
        //   techniques: ["QW-CSS-T1"]
        // });

        const report = await executeCSST(stylesheets);
        //console.log("TCL: report.techniques.length", report.techniques['QW-CSS-T1'].metadata);
        expect(report.techniques['QW-CSS-T1'].metadata.outcome).to.be.equal(test.outcome);
      });
    });
  }
  describe(``,  function () {
    it(`pup shutdown`, async function () {
      await browser.close();
    });
  });
});
