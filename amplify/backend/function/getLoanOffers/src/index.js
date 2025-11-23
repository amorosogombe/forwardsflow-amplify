const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Get Loan Offers Event:', JSON.stringify(event));
  
  const { borrowerId, amount, duration } = event.arguments;
  
  try {
    // Get active banks
    const banksParams = {
      TableName: process.env.BANK_TABLE,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'ACTIVE'
      }
    };
    
    const banksResult = await dynamodb.scan(banksParams).promise();
    const banks = banksResult.Items;
    
    // Calculate offers from each bank
    const offers = banks.map(bank => {
      // Interest rate calculation based on duration and bank's rates
      let baseRate = 100; // 100% APR base
      
      if (duration === 30) baseRate = 110;
      else if (duration === 60) baseRate = 115;
      else if (duration === 90) baseRate = 125;
      
      // Add bank's margin
      const interestRate = baseRate + (Math.random() * 20 - 10);
      const apr = interestRate;
      
      // Calculate total repayable
      const dailyRate = apr / 365 / 100;
      const totalRepayable = amount * (1 + (dailyRate * duration));
      
      return {
        bankId: bank.id,
        bankName: bank.name,
        amount,
        interestRate: Math.round(interestRate * 10) / 10,
        apr: Math.round(apr * 10) / 10,
        totalRepayable: Math.round(totalRepayable),
        duration,
        processingTime: '5-15 minutes'
      };
    });
    
    // Sort by interest rate (lowest first)
    offers.sort((a, b) => a.interestRate - b.interestRate);
    
    return offers.slice(0, 3); // Return top 3 offers
    
  } catch (error) {
    console.error('Error getting loan offers:', error);
    throw error;
  }
};
