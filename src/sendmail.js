const nodeMailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodeMailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: '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'
    }
  })
)

// karolinemotaasousa@gmail.com

const sendEmail = () => {
  transporter.sendMail({
    to: 'luucasfarias21@gmail.com',
    from: 'lucdev021@gmail.com',
    subject: 'Monitoramento de loja virtual para anakStore',
    html: ({ path: './index.html' })
  });
}


exports.main = () => {
  sendEmail();
}


// regra de envio email.
// faço insert no banco de dados a primeira vez que for feita a requisição,
// nas proximas verificacoes eu faço um select pra ver se o email do dia ja foi enviado.
// se ja foi, nao faz nada.