const fs = require('fs');
const ejs = require('ejs');
const htmlToText = require('html-to-text');
const nodemailer = require('nodemailer');
const juice = require('juice');
const path = require('path');
const config = require('../../config.local');

const mailService = {
  smtp: nodemailer.createTransport({
    host: config.mail.hostname,
    port: 587,
    // secure: process.env.NODE_ENV !== 'dev',
    auth: {
      user: config.mail.username,
      pass: config.mail.password,
    },
  }),
  templateFiller(templateVariables, templateFileName) {
    const templatePath = `./mailTemplates/${templateFileName}.html`;
    const emailDataAndFields = {};

    if (templateFileName && fs.existsSync(path.resolve(__dirname, templatePath))) {
      const template = fs.readFileSync(path.resolve(__dirname, templatePath), 'utf-8');
      const html = ejs.render(template, templateVariables);
      const text = htmlToText.htmlToText(html);
      const htmlWithStylesInlined = juice(html);

      emailDataAndFields.html = htmlWithStylesInlined;
      emailDataAndFields.text = text;
    }

    return emailDataAndFields;
  },
  async sendEmail(emailDataAndFields, mailFields) {
    const data = {
      ...emailDataAndFields,
      ...mailFields,
    };
    await this.smtp.sendMail(data);
  },
};

module.exports = mailService;
