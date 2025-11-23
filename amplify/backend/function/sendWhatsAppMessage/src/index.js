const AWS = require('aws-sdk');
const axios = require('axios');

exports.handler = async (event) => {
  console.log('WhatsApp Message Event:', JSON.stringify(event));
  
  const { phoneNumber, message } = event.arguments;
  
  try {
    // Get Twilio credentials from Secrets Manager
    const secretsManager = new AWS.SecretsManager();
    const secretData = await secretsManager.getSecretValue({
      SecretId: process.env.TWILIO_SECRET_ARN
    }).promise();
    
    const secrets = JSON.parse(secretData.SecretString);
    
    // Send WhatsApp message via Twilio
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${secrets.accountSid}/Messages.json`,
      new URLSearchParams({
        From: `whatsapp:${secrets.whatsappNumber}`,
        To: `whatsapp:${phoneNumber}`,
        Body: message
      }),
      {
        auth: {
          username: secrets.accountSid,
          password: secrets.authToken
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return {
      success: true,
      messageId: response.data.sid,
      message: 'Message sent successfully'
    };
    
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return {
      success: false,
      message: `Failed to send message: ${error.message}`
    };
  }
};
