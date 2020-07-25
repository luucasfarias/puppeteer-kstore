const puppeteer = require("puppeteer");
const cron = require("node-cron");
const mysql = require("../src/db/connection").pool;
const sendmail = require('./sendmail');
const nodemailer = require('nodemailer');
const nodemailerSendgrid = require('nodemailer-sendgrid');

const checkStore = text => console.log("\x1b[36m%s\x1b[0m", `[Check Store] ${text}`);

function getRecords() {
  mysql.getConnection((error, conn) => {
    conn.query(`SELECT * FROM dados;`, (error, result, fields) => {
      if(error) return console.log(error);
      console.log('fez a consulta!');
      console.log(result);
      conn.end();
    });
  });
}

function checkOpenStore(nameStore, dateEmail, statusEmail) {
  mysql.getConnection((error, conn) => {
    conn.query(`SELECT * FROM dados WHERE name_store like '${nameStore}' and
      data_email = '${dateEmail}' and status_envio = '${statusEmail}';`, (error, result, fields) => {
      if(error) return console.log(error);

      if (result.length > 0) {
        console.log('tem resultado');
        /*
          If condição satisfeita, é porq ja rodou a rotina e eu nao preciso mais enviar email.
        */
      } else {
        console.log('nao tem resultado');
      }
      conn.end();
    });
  });
}

function addRows(nameStore, dateEmail, statusEmail) {
  var date = new Date();
  mysql.getConnection((error, conn) => {
    const sql = "INSERT INTO dados(name_store, data_email, status_envio) VALUES ?";
    const values = [
      [nameStore, dateEmail, statusEmail]
    ];
    conn.query(sql, [values], function (error, results, fields){
      if(error) return console.log(error);
      checkStore(`Loja ${nameStore} inserida na base de dados as ${date.toLocaleTimeString()} - ${date.toDateString()}`);
      conn.end(); // fecha a conexão
    });
  });
}

function sendMail() {
  const transport = nodemailer.createTransport(
    nodemailerSendgrid({
      apiKey: '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'
    })
  );

  transport.sendMail({
    to: 'luucasfarias21@gmail.com',
    from: 'lucdev021@gmail.com',
    subject: 'Monitoramento de loja virtual para anakStore',
    html: '<h1>Hello world!</h1>'
  });
}

function main() {
  cron.schedule("*/1 * * * *", async () => {
    var date = new Date();
    (async () => {
      let storeUrl = 'https://useflorbela.com.br/';
      
      let browser = await puppeteer.launch();
      let page = await browser.newPage();
      await page.goto(storeUrl, { waitUntil: 'networkidle2' });
    
      checkStore(`Iniciando verificação as ${date.toLocaleTimeString()} - ${date.toDateString()}`);
  
      let data = await page.evaluate(() => {
        let nameStore = document.querySelector('body > div.mt-4 > section.section-instafeed-home > div.container > div > div > a > h3').innerText;
        let titleStore = document.querySelector('body > div.mt-4 > section:nth-child(4) > div.container > div > div.col-12.text-center > h3').innerText;
        return {
          nameStore,
          titleStore
        }
      });
    
      console.log(`O nome da loja é: ${data.nameStore}, acompanhame os ${data.titleStore}`);

      if (data) {
        sendMail();
        addRows(data.nameStore, "2020-07-24", "N");
      }
      await browser.close();
    })();
  });
}

main();
