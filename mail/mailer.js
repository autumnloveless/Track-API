"use strict";
const nodemailer = require("nodemailer");
const mjml2html = require('mjml')
const handlebars = require('handlebars');
const fs = require('fs');
var path = require('path');
var Rollbar = require('rollbar');
var rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true
});

let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMPT_PORT,
    auth: {
      user: process.env.SMTP_AUTH_USER,
      pass: process.env.SMTP_AUTH_PASSWORD,
    },
});

const getFileText = (filename, options) => {
  let data = fs.readFileSync(path.join(__dirname, filename), { encoding: 'utf8'});
  let template = handlebars.compile(data);
  let compiled = template(options);
  return mjml2html(compiled);
}

exports.forgotPassword = async (userEmail, resetPasswordLink) => {
  // send mail with defined transport object
  let { html: htmlBody } = getFileText('./templates/reset.mjml', { resetPasswordLink: resetPasswordLink });

  let info = await transporter.sendMail({
    from: '"Lumin Support 🦕" <' + process.env.SUPPORT_EMAIL + '>', // sender address
    to: userEmail, // list of receivers
    subject: "Forgot Password", // Subject line
    text: `Go to the link below to reset your password: ${resetPasswordLink}`, // plain text body
    html: htmlBody, // html body
  });

  rollbar.log("Email sent: " + info.messageId);

  // Preview only available when sending through an Ethereal account
  if(!process.env.NODE_ENV || process.env.NODE_ENV == 'development'){
    console.log("Preview URL: " + nodemailer.getTestMessageUrl(info));
  }
};
