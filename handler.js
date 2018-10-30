'use strict';

const aws = require('aws-sdk');
const ses = new aws.SES();

const myEmail = process.env.EMAIL;

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

module.exports.handleForm = async (event, context) => {
  try {
    const emailParams = generateEmailParams(event.body);
    const data = await ses.sendEmail(emailParams).promise();

    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'x-requested-with',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'x-requested-with',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 500,
      body: JSON.stringify(err.message)
    };
  }
};
