const {
  configure,
  executeCSST
} = require('../../dist/index');
const { expect } = require('chai');
const { getDom } = require('@qualweb/get-dom-puppeteer')

describe('Technique QW-CSS-T1', function() {
  it('should execute', async function() {
    this.timeout(10 * 1000)
    const { stylesheets } = await getDom("https://ciencias.ulisboa.pt/pt");
    const report = await executeCSST(stylesheets);

		console.log("TCL: report.techniques.length", report.techniques['QW-CSS-T1'].metadata)
    expect(report.techniques['QW-CSS-T1'].results.length).to.be.greaterThan(0);
  })
});