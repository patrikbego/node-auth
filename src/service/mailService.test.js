const passport = require('passport');
const fs = require('fs');
const path = require('path');
const mock = require('../mockObjects');
const db = require('../repository/db-migrate');
const mailService = require('./mailService');

describe('Mail test', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    await db.migrate.latest();
  });

  afterAll(async (done) => {
    await db.migrate.rollback();
    await db.destroy();
    console.log('Migrating down');
    done();
  });

  test('Template test', async () => {
    const templateVars = {
      emailAddress: 'test@test.com',
      resetLink: 'https://octoplasm.com/223442',
    };
    const generatedData = mailService.templateFiller(templateVars, 'confirmEmailT');

    const fullHtmlBodyPath = './mailTemplates/confirmEmail.html';
    const fullHtmlBody = fs.readFileSync(path.resolve(__dirname, fullHtmlBodyPath),
      'utf-8');

    expect(generatedData.html).toContain('https://octoplasm.com/223442');
  });

  // End to end test
  // test('Mail send test', async () => {
  //   const templateVars = {
  //     emailAddress: 'test@test.com',
  //     resetLink: 'https://octoplasm.com/223442',
  //   };
  //   const generatedData = mailService.templateFiller(templateVars, 'confirmEmailT');
  //   await mailService.sendEmail(generatedData, {
  //     to: 'patrik.delo@gmail.com',
  //     from: 'support@octoplasm.com',
  //     subject: 'Please reset your password',
  //   });
  // });
});
