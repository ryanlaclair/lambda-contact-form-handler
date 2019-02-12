'use strict';

const aws = require('aws-sdk');
const request = require('request');

const myEmail = process.env.EMAIL;
const secret = process.env.SECRET;

const ses = new aws.SES();

const response = {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'x-requested-with',
    'Access-Control-Allow-Credentials': true
  }
};

function generateEmailParams(body) {
  const { firstName, lastName, email, message } = JSON.parse(body);

  return {
    Source: myEmail,
    Destination: { ToAddresses: [myEmail] },
    ReplyToAddresses: [email],
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: `Message from ${firstName}: \n\n${message}`
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `Contact from ${firstName} ${lastName}`
      }
    }
  };
}

module.exports.handleForm = async (event, context, callback) => {
  try {
    const token = event.body.token;

    await request.post(
      {
        url: 'https://www.google.com/recaptcha/api/siteverify',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'x-requested-with',
          'Access-Control-Allow-Credentials': true
        },
        form: {
          secret: secret,
          response: token
        }
      },
      (err, res, body) => {
        const recaptcha = JSON.parse(body);

        if (err) {
          response.statusCode = 500;
          response.body = JSON.stringify(err);
        } else if (res.statusCode != 200) {
          response.statusCode = 420;
          response.body = res.body;
        } else if (recaptcha.success && recaptcha.score > 0.5) {
          response.statusCode = 200;

          const emailParams = generateEmailParams(event.body);
          ses.sendEmail(emailParams);
        } else {
          response.statusCode = 500;
          body.secret = secret;
          body.token = token;
          response.body = body;
        }
      }
    );

    callback(null, response);
  } catch (err) {
    response.statusCode = 500;
    callback(null, response);
  }
};
