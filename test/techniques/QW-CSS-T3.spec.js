const {
  configure,
  executeCSST
} = require('../../dist/index');
const { expect } = require('chai');
const { getDom } = require('@qualweb/get-dom-puppeteer')

describe('Technique QW-CSS-T3', function() {
  it('should have  150% | 1.5 <= line-height <= 200% | 2', async function() {
    this.timeout(10 * 1000)
    const { stylesheets } = await getDom("https://techandpeople.github.io");
    const report = await executeCSST(stylesheets);

		console.log("TCL: report.techniques.length", report.techniques['QW-CSS-T3'].metadata)
    expect(report.techniques['QW-CSS-T3'].results.length).to.be.greaterThan(0);
  });
  it('shouldnt have  150% <= line-height <= 200%', async function() {
    this.timeout(10 * 1000)
    const { stylesheets } = await getDom("https://techandpeople.github.io");
    const report = await executeCSST(stylesheets);

		console.log("TCL: report.techniques.length", report.techniques['QW-CSS-T3'].metadata)
    expect(report.techniques['QW-CSS-T3'].results.length).to.be.greaterThan(0);
  });
});