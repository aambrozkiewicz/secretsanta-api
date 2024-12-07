const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport(
  {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  {
    from: '"Sekretny 🎅 Mikołaj" <secretsanta@eatally.pl>',
  }
);

const templates = {
  welcomeEmail: {
    subject: "🎁 Wynik losowania sekretnego Mikołaja",
    html: `<p>Koniec czekania! Wylosowałeś,</p><h2>{receiver}</h2><p>Dobra wiadomość jest taka, że Ciebie też ktoś wylosował. Możesz mu dać wskazówki dotyczące prezentu <a href="${process.env.BASE_WEBAPP_URL}/wishlist/{hash}">tutaj</a>.</p>`,
  },
  wishNotification: {
    subject: "☃️ {receiver} uzupełnił swój list do Mikołaja",
    html: `<p>Wskazówki możesz zobaczyć pod <a href="${process.env.BASE_WEBAPP_URL}/wishlist/{hash}">tutaj</a></p>`,
  },
};

function render(template, values) {
  return template.replace(/{([^{}]+)}/g, function (keyExpr, key) {
    return values[key] || "";
  });
}

exports.sendMail = async (to, templateName, values = {}) => {
  await transporter.sendMail({
    to,
    subject: render(templates[templateName].subject, values),
    html: render(templates[templateName].html, values),
  });
};
