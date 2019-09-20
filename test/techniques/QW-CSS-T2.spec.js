 
const {
  configure,
  executeCSST
} = require('../../dist/index');
const { expect } = require('chai');
const { getDom } = require('@qualweb/get-dom-puppeteer')

describe('Technique QW-CSS-T2', function() {
  it('should have text-align: left and pass', async function() {
    this.timeout(10 * 1000)
    const { stylesheets } = await getDom("https://ciencias.ulisboa.pt/pt");
    const report = await executeCSST(stylesheets);

		console.log("TCL: report.techniques.length", report.techniques['QW-CSS-T2'].metadata)
    expect(report.techniques['QW-CSS-T2'].results.length).to.be.greaterThan(0);
  })
  it('should have text-align: justify and fail', async function() {
    this.timeout(10 * 1000)
    const { stylesheets } = await getDom("https://ciencias.ulisboa.pt/pt");
    const report = await executeCSST(stylesheets);

		console.log("TCL: report.techniques.length", report.techniques['QW-CSS-T2'].metadata)
    expect(report.techniques['QW-CSS-T2'].results.length).to.be.greaterThan(0);
  })
  it('shouldn\'t have text-align and should fail', async function() {
    this.timeout(10 * 1000)
    const { stylesheets } = await getDom("https://ciencias.ulisboa.pt/pt");
    const report = await executeCSST(stylesheets);

		console.log("TCL: report.techniques.length", report.techniques['QW-CSS-T2'].metadata)
    expect(report.techniques['QW-CSS-T2'].results.length).to.be.greaterThan(0);
  })
});