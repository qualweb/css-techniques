const {
  configure,
  executeCSST
} = require('../../dist/index');
const { expect } = require('chai');
const { getDom } = require('@qualweb/get-dom-puppeteer')

describe('Technique QW-CSS-T1', function() {

  const URL = 'http://accessible-serv.lasige.di.fc.ul.pt/~jvicente/test/';

  it('should execute', async function() {
    this.timeout(10 * 1000)
    const { stylesheets } = await getDom(URL);
    const report = await executeCSST(stylesheets);

    expect(report.techniques['QW-CSS-T1'].results.length).to.be.greaterThan(0);
  })
});