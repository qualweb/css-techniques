const {
  configure,
  executeCSST
} = require('../../dist/index');
const { expect } = require('chai');
const { getDom } = require('@qualweb/get-dom-puppeteer')

describe('Technique QW-CSS-T5', function() {

  const URL = 'http://accessible-serv.lasige.di.fc.ul.pt/~asantos/';

  it('should execute', async function() {
    this.timeout(10 * 1000)
    const { stylesheets } = await getDom(URL);
    const report = await executeCSST(stylesheets);

    console.log(report.techniques['QW-CSS-T5']);
    expect(report.techniques['QW-CSS-T5'].results.length).to.be.greaterThan(0);
  })
});