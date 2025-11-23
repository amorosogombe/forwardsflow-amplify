/**
 * Lambda Function: Loan Approval
 * Handles automated loan approval based on credit scoring
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Credit scoring thresholds
const CREDIT_THRESHOLDS = {
  EXCELLENT: 700,
  GOOD: 650,
  FAIR: 600,
  POOR: 550
};

// Auto-approval limits based on credit score
const APPROVAL_LIMITS = {
  EXCELLENT: 100000,  // KES
  GOOD: 50000,
  FAIR: 25000,
  POOR: 10000
};

exports.handler = async (event) => {
  console.log('Loan Approval Event:', JSON.stringify(event));
  
  const { loanId, approved, notes } = event.arguments;
  
  try {
    // Get loan details
    const loan = await getLoan(loanId);
    
    if (!loan) {
      return {
        success: false,
        loanId,
        message: 'Loan not found'
      };
    }
    
    // Get borrower details
    const borrower = await getBorrower(loan.borrowerId);
    
    // Calculate risk score
    const riskScore = calculateRiskScore(borrower, loan);
    
    // Determine auto-approval eligibility
    const autoApprovalEligible = isAutoApprovalEligible(
      borrower.creditScore,
      loan.amount,
      borrower.defaultedLoans
    );
    
    // Update loan status
    const updateParams = {
      TableName: process.env.MOBILELOAN_TABLE,
      Key: { id: loanId },
      UpdateExpression: 'SET #status = :status, approvalDate = :approvalDate, riskScore = :riskScore, notes = :notes',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': approved ? 'APPROVED' : 'REJECTED',
        ':approvalDate': new Date().toISOString(),
        ':riskScore': riskScore,
        ':notes': notes || 'Auto-approved'
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamodb.update(updateParams).promise();
    
    // Send notification to borrower
    if (approved) {
      await sendApprovalNotification(borrower.phoneNumber, loan);
    } else {
      await sendRejectionNotification(borrower.phoneNumber, loan);
    }
    
    // Log transaction
    await logTransaction({
      type: 'LOAN_APPROVAL',
      loanId,
      borrowerId: loan.borrowerId,
      amount: loan.amount,
      status: approved ? 'APPROVED' : 'REJECTED',
      metadata: {
        riskScore,
        autoApproved: autoApprovalEligible,
        notes
      }
    });
    
    return {
      success: true,
      loanId,
      message: approved ? 'Loan approved successfully' : 'Loan rejected'
    };
    
  } catch (error) {
    console.error('Error approving loan:', error);
    return {
      success: false,
      loanId,
      message: `Error: ${error.message}`
    };
  }
};

async function getLoan(loanId) {
  const params = {
    TableName: process.env.MOBILELOAN_TABLE,
    Key: { id: loanId }
  };
  
  const result = await dynamodb.get(params).promise();
  return result.Item;
}

async function getBorrower(borrowerId) {
  const params = {
    TableName: process.env.BORROWER_TABLE,
    Key: { id: borrowerId }
  };
  
  const result = await dynamodb.get(params).promise();
  return result.Item;
}

function calculateRiskScore(borrower, loan) {
  let score = borrower.creditScore || 500;
  
  // Adjust for loan amount relative to total borrowed
  const loanToTotalRatio = loan.amount / (borrower.totalBorrowed || 1);
  if (loanToTotalRatio > 0.5) score -= 20;
  
  // Adjust for default history
  if (borrower.defaultedLoans > 0) {
    score -= borrower.defaultedLoans * 50;
  }
  
  // Adjust for repayment history
  const repaymentRate = borrower.totalRepaid / (borrower.totalBorrowed || 1);
  if (repaymentRate > 0.95) score += 30;
  else if (repaymentRate < 0.7) score -= 40;
  
  return Math.max(300, Math.min(850, score));
}

function isAutoApprovalEligible(creditScore, loanAmount, defaultedLoans) {
  if (defaultedLoans > 0) return false;
  
  if (creditScore >= CREDIT_THRESHOLDS.EXCELLENT && loanAmount <= APPROVAL_LIMITS.EXCELLENT) {
    return true;
  } else if (creditScore >= CREDIT_THRESHOLDS.GOOD && loanAmount <= APPROVAL_LIMITS.GOOD) {
    return true;
  } else if (creditScore >= CREDIT_THRESHOLDS.FAIR && loanAmount <= APPROVAL_LIMITS.FAIR) {
    return true;
  }
  
  return false;
}

async function sendApprovalNotification(phoneNumber, loan) {
  const sns = new AWS.SNS();
  
  const message = `Great news! Your loan of KES ${loan.amount.toLocaleString()} has been approved. The money will be sent to your MPESA shortly.`;
  
  const params = {
    Message: message,
    PhoneNumber: phoneNumber,
    MessageAttributes: {
      'AWS.SNS.SMS.SMSType': {
        DataType: 'String',
        StringValue: 'Transactional'
      }
    }
  };
  
  try {
    await sns.publish(params).promise();
    console.log('Approval notification sent to:', phoneNumber);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

async function sendRejectionNotification(phoneNumber, loan) {
  const sns = new AWS.SNS();
  
  const message = `We're sorry, but your loan application for KES ${loan.amount.toLocaleString()} could not be approved at this time. Please try again with a smaller amount.`;
  
  const params = {
    Message: message,
    PhoneNumber: phoneNumber
  };
  
  try {
    await sns.publish(params).promise();
    console.log('Rejection notification sent to:', phoneNumber);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

async function logTransaction(data) {
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
