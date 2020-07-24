const puppeteer = require('puppeteer');
const cron = require("node-cron");

const checkStore = text => console.log("\x1b[36m%s\x1b[0m", `[Check Store] ${text}`);

cron.schedule("*/1 * * * *", async () => {
  var date = new Date();
  (async () => {
    let storeUrl = 'https://useflorbela.com.br/';
    
    let browser = await puppeteer.launch();
    let page = await browser.newPage();
    await page.goto(storeUrl, { waitUntil: 'networkidle2' });
  
    checkStore(`Iniciando verificação as ${date.toLocaleTimeString()} - ${date.toDateString()}`);

    let data = await page.evaluate(() => {
      let titleStore = document.querySelector('body > div.mt-4 > section:nth-child(4) > div.container > div > div.col-12.text-center > h3').innerText;
      return {
        titleStore
      }
    });
  
    console.log(data);
  
    await browser.close();
  })();
});