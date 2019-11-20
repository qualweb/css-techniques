const {
  configure,
  executeCSST
} = require('../../dist/index');
const {expect} = require('chai');
const {getDom} = require('@qualweb/get-dom-puppeteer');

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
        const {stylesheets} = await getDom(test.url);


        const report = await executeCSST(stylesheets);
        console.log(report.techniques['QW-CSS-T3']);
        expect(report.techniques['QW-CSS-T3'].metadata.outcome).to.be.equal(test.outcome);
      });
    });
  }
});
