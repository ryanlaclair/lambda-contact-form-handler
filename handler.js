'use strict';

const aws = require('aws-sdk');
const ses = new aws.SES();

const myEmail = process.env.EMAIL;

function generateResponse(code, payload) {
  return {
    statusCode: code,
    body: JSON.stringify(payload)
  };
}

function generateError(code, err) {
  console.log(err);
  return {
    statusCode: code,
    body: JSON.stringify(err.message)
  };
}

function generateEmailParams(body) {
  // const { email, name, content } = JSON.parse(body);

  // if (!(email && name && content)) {
  //   throw new Error(
  //     "Missing parameters! Make sure to add parameters 'email', 'name', 'content'."
  //   );
  // }

  return {
    Source: myEmail,
    Destination: { ToAddresses: [myEmail] },
    ReplyToAddresses: ['test@gmail.com'],
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: 'TEST'
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'TEST'
      }
    }
  };
}

module.exports.handleForm = async (event, context) => {
  try {
    const emailParams = generateEmailParams(event.body);
    const data = await ses.sendEmail(emailParams).promise();
    return generateResponse(200, data);
  } catch (err) {
    return generateError(500, err);
  }
};
