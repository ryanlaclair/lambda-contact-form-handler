'use strict';

const aws = require('aws-sdk');
const axios = require('axios');

const myEmail = process.env.EMAIL;
const secret = process.env.CAPTCHA;

const ses = new aws.SES();

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
  var response = {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': false
    }
  };

  try {
    const token = JSON.parse(event.body).token;

    var res = await axios({
      method: 'POST',
      url: 'https://www.google.com/recaptcha/api/siteverify',
      params: {
        secret: secret,
        response: token
      }
    });

    if (res.status == 200 && res.data.success && res.data.score > 0.5) {
      console.log('Sending email');

      const emailParams = generateEmailParams(event.body);
      const data = await ses.sendEmail(emailParams).promise();

      response.statusCode = 200;
      response.body = JSON.stringify(data);

      return response;
    } else {
      console.log('Invalid recaptcha');

      response.statusCode = 500;
      response.body = JSON.stringify({ status: 'Invalid recaptcha' });

      return response;
    }
  } catch (err) {
    response.statusCode = 500;
    response.body = JSON.stringify(err);

    return response;
  }
};
