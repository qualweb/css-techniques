const {
  configure,
  executeCSST
} = require('../../dist/index');
const { expect } = require('chai');
const { getDom } = require('@qualweb/get-dom-puppeteer')

describe('Technique QW-CSS-T3', function() {
  it('shouldnt blink', async function() {
    this.timeout(10 * 1000)
    const { stylesheets } = await getDom("https://techandpeople.github.io");
    const report = await executeCSST(stylesheets);

		console.log("TCL: report.techniques.length", report.techniques['QW-CSS-T6'].metadata)
    expect(report.techniques['QW-CSS-T6'].results.length).to.be.greaterThan(0);
  });
});