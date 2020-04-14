const {
  CSSTechniques
} = require('../dist/index');
const {expect} = require('chai');

const puppeteer = require('puppeteer');
const { getDom } = require('./getDom');

describe('CSS Techniques module', function() {
  it('Should evaluate all', async function() {
    this.timeout(100 * 1000);
    const browser = await puppeteer.launch();

    const { stylesheets } = await getDom(browser, 'https://ciencias.ulisboa.pt');

    const cssTechniques = new CSSTechniques();

    const report = await cssTechniques.execute(stylesheets);
    console.log(report);
    await browser.close();
  });
});