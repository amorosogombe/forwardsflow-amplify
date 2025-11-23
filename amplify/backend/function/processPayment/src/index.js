/**
 * Lambda Function: Process MPESA Payment
 * Handles MPESA Daraja API integration for loan disbursements and repayments
 */

const AWS = require('aws-sdk');
const axios = require('axios');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// MPESA Configuration
const MPESA_CONFIG = {
  CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY,
  CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET,
  SHORTCODE: process.env.MPESA_SHORTCODE,
  PASSKEY: process.env.MPESA_PASSKEY,
  CALLBACK_URL: process.env.MPESA_CALLBACK_URL,
  AUTH_URL: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
  STK_PUSH_URL: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
  B2C_URL: 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest'
};

exports.handler = async (event) => {
  console.log('MPESA Payment Event:', JSON.stringify(event));
  
  const { loanId, amount, method, mpesaPhone } = event.arguments.input;
  
  try {
    // Get access token
    const accessToken = await getAccessToken();
    
    // Determine operation type
    const operation = event.info.fieldName;
    
    let result;
    if (operation === 'disburseLoan') {
      // B2C - Business to Customer (Disbursement)
      result = await disburseFunds(accessToken, mpesaPhone, amount, loanId);
    } else if (operation === 'processPayment') {
      // STK Push - Customer payment collection
      result = await collectPayment(accessToken, mpesaPhone, amount, loanId);
    }
    
    // Store transaction record
    await storeTransaction({
      loanId,
      amount,
      method: 'MPESA',
      mpesaReference: result.CheckoutRequestID || result.ConversationID,
      status: 'PROCESSING',
      type: operation === 'disburseLoan' ? 'LOAN_DISBURSEMENT' : 'LOAN_REPAYMENT'
    });
    
    return {
      success: true,
      transactionId: result.CheckoutRequestID || result.ConversationID,
      mpesaReference: result.MpesaReceiptNumber || result.ConversationID,
      message: 'Payment initiated successfully'
    };
    
  } catch (error) {
    console.error('MPESA Error:', error);
    return {
      success: false,
      message: `Payment failed: ${error.message}`
    };
  }
};

/**
 * Get MPESA OAuth Access Token
 */
async function getAccessToken() {
  const auth = Buffer.from(`${MPESA_CONFIG.CONSUMER_KEY}:${MPESA_CONFIG.CONSUMER_SECRET}`).toString('base64');
  
  const response = await axios.get(MPESA_CONFIG.AUTH_URL, {
    headers: {
      Authorization: `Basic ${auth}`
    }
  });
  
  return response.data.access_token;
}

/**
 * Collect Payment from Customer (STK Push)
 */
async function collectPayment(accessToken, phoneNumber, amount, loanId) {
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(
    `${MPESA_CONFIG.SHORTCODE}${MPESA_CONFIG.PASSKEY}${timestamp}`
  ).toString('base64');
  
  // Format phone number (remove + and ensure 254 prefix)
  const formattedPhone = phoneNumber.replace(/\+/g, '').replace(/^0/, '254');
  
  const payload = {
    BusinessShortCode: MPESA_CONFIG.SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: MPESA_CONFIG.SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: MPESA_CONFIG.CALLBACK_URL,
    AccountReference: `LOAN-${loanId}`,
    TransactionDesc: `Loan Repayment - ${loanId}`
  };
  
  const response = await axios.post(MPESA_CONFIG.STK_PUSH_URL, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data;
}

/**
 * Disburse Funds to Customer (B2C)
 */
async function disburseFunds(accessToken, phoneNumber, amount, loanId) {
  const formattedPhone = phoneNumber.replace(/\+/g, '').replace(/^0/, '254');
  
  const payload = {
    InitiatorName: process.env.MPESA_INITIATOR_NAME,
    SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
    CommandID: 'BusinessPayment',
    Amount: Math.round(amount),
    PartyA: MPESA_CONFIG.SHORTCODE,
    PartyB: formattedPhone,
    Remarks: `Loan Disbursement - ${loanId}`,
    QueueTimeOutURL: `${MPESA_CONFIG.CALLBACK_URL}/timeout`,
    ResultURL: `${MPESA_CONFIG.CALLBACK_URL}/result`,
    Occassion: `ForwardsFlow Loan ${loanId}`
  };
  
  const response = await axios.post(MPESA_CONFIG.B2C_URL, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data;
}

/**
 * Store transaction in DynamoDB
 */
async function storeTransaction(data) {
  const params = {
    TableName: process.env.TRANSACTION_TABLE,
    Item: {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  await dynamodb.put(params).promise();
}

/**
 * MPESA Callback Handler
 * This should be a separate Lambda function triggered by API Gateway
 */
exports.callbackHandler = async (event) => {
  console.log('MPESA Callback:', JSON.stringify(event));
  
  const body = JSON.parse(event.body);
  const resultCode = body.Body?.stkCallback?.ResultCode || body.Result?.ResultCode;
  
  if (resultCode === 0) {
    // Payment successful
    const mpesaReceiptNumber = body.Body?.stkCallback?.CallbackMetadata?.Item?.find(
      item => item.Name === 'MpesaReceiptNumber'
    )?.Value;
    
    // Update transaction status
    await updateTransactionStatus(mpesaReceiptNumber, 'COMPLETED');
    
    // Update loan payment
    await recordLoanPayment(body);
  } else {
    // Payment failed
    await updateTransactionStatus(body.CheckoutRequestID, 'FAILED');
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({ ResultCode: 0, ResultDesc: 'Accepted' })
  };
};

async function updateTransactionStatus(referenceId, status) {
  const params = {
    TableName: process.env.TRANSACTION_TABLE,
    Key: { mpesaReference: referenceId },
    UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':updatedAt': new Date().toISOString()
    }
  };
  
  await dynamodb.update(params).promise();
}

async function recordLoanPayment(callbackData) {
  // Extract payment details and update loan record
  const amount = callbackData.Body?.stkCallback?.CallbackMetadata?.Item?.find(
    item => item.Name === 'Amount'
  )?.Value;
  
  const accountReference = callbackData.Body?.stkCallback?.AccountReference;
  const loanId = accountReference.replace('LOAN-', '');
  
  // Create payment record
  const paymentParams = {
    TableName: process.env.PAYMENT_TABLE,
    Item: {
      id: `pmt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      loanId,
      amount,
      paymentDate: new Date().toISOString(),
      status: 'COMPLETED',
      method: 'MPESA',
      mpesaReference: callbackData.Body?.stkCallback?.MpesaReceiptNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  await dynamodb.put(paymentParams).promise();
  
  // Update loan outstanding balance
  const loanParams = {
    TableName: process.env.MOBILELOAN_TABLE,
    Key: { id: loanId },
    UpdateExpression: 'SET outstanding = outstanding - :amount, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':amount': amount,
      ':updatedAt': new Date().toISOString()
    }
  };
  
  await dynamodb.update(loanParams).promise();
}
