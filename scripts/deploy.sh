#!/bin/bash

#############################################
# ForwardsFlow AWS Amplify Deployment Script
#############################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   ForwardsFlow AWS Amplify Deployment                ║"
echo "║   Version 1.0.0                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if environment is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Environment not specified${NC}"
    echo "Usage: ./deploy.sh [dev|staging|prod]"
    exit 1
fi

ENVIRONMENT=$1

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    echo -e "${RED}Error: Invalid environment. Use dev, staging, or prod${NC}"
    exit 1
fi

echo -e "${YELLOW}Deploying to: ${ENVIRONMENT}${NC}"
echo ""

#############################################
# Step 1: Check Prerequisites
#############################################

echo -e "${GREEN}Step 1: Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi
echo "✓ Node.js $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi
echo "✓ npm $(npm --version)"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    exit 1
fi
echo "✓ AWS CLI $(aws --version)"

# Check Amplify CLI
if ! command -v amplify &> /dev/null; then
    echo -e "${RED}Error: Amplify CLI is not installed${NC}"
    echo "Install with: npm install -g @aws-amplify/cli"
    exit 1
fi
echo "✓ Amplify CLI"

echo ""

#############################################
# Step 2: Install Dependencies
#############################################

echo -e "${GREEN}Step 2: Installing dependencies...${NC}"
npm ci
echo "✓ Dependencies installed"
echo ""

#############################################
# Step 3: Configure Environment
#############################################

echo -e "${GREEN}Step 3: Configuring environment...${NC}"

# Check if environment exists
if amplify env list | grep -q "$ENVIRONMENT"; then
    echo "✓ Environment '$ENVIRONMENT' exists"
    amplify env checkout $ENVIRONMENT
else
    echo -e "${YELLOW}Creating new environment: $ENVIRONMENT${NC}"
    amplify env add $ENVIRONMENT
fi

echo ""

#############################################
# Step 4: Deploy Backend
#############################################

echo -e "${GREEN}Step 4: Deploying backend resources...${NC}"
echo "This may take 10-15 minutes..."

amplify push --yes

echo "✓ Backend deployed"
echo ""

#############################################
# Step 5: Deploy CloudFormation Stack
#############################################

echo -e "${GREEN}Step 5: Deploying additional infrastructure...${NC}"

STACK_NAME="forwardsflow-infrastructure-${ENVIRONMENT}"

# Check if stack exists
if aws cloudformation describe-stacks --stack-name $STACK_NAME &> /dev/null; then
    echo "Updating existing stack..."
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://cloudformation-template.yaml \
        --parameters ParameterKey=EnvironmentName,ParameterValue=$ENVIRONMENT \
        --capabilities CAPABILITY_NAMED_IAM
else
    echo "Creating new stack..."
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://cloudformation-template.yaml \
        --parameters ParameterKey=EnvironmentName,ParameterValue=$ENVIRONMENT \
        --capabilities CAPABILITY_NAMED_IAM
fi

echo "Waiting for stack deployment..."
aws cloudformation wait stack-create-complete --stack-name $STACK_NAME || \
aws cloudformation wait stack-update-complete --stack-name $STACK_NAME

echo "✓ Infrastructure deployed"
echo ""

#############################################
# Step 6: Build Frontend
#############################################

echo -e "${GREEN}Step 6: Building frontend...${NC}"

npm run build

echo "✓ Frontend built"
echo ""

#############################################
# Step 7: Publish Application
#############################################

echo -e "${GREEN}Step 7: Publishing application...${NC}"

amplify publish --yes

echo "✓ Application published"
echo ""

#############################################
# Step 8: Get Deployment Info
#############################################

echo -e "${GREEN}Step 8: Retrieving deployment information...${NC}"

# Get Amplify app ID
APP_ID=$(amplify status --json | jq -r '.appId')

# Get CloudFront URL
CLOUDFRONT_URL=$(aws amplify get-app --app-id $APP_ID --query 'app.defaultDomain' --output text)

# Get API endpoint
API_ENDPOINT=$(amplify status --json | jq -r '.api.endpoint')

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           Deployment Successful! 🎉                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Deployment Information:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Environment:      ${GREEN}${ENVIRONMENT}${NC}"
echo -e "Application URL:  ${GREEN}https://${CLOUDFRONT_URL}${NC}"
echo -e "API Endpoint:     ${GREEN}${API_ENDPOINT}${NC}"
echo -e "Region:           ${GREEN}$(aws configure get region)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure custom domain (optional)"
echo "2. Set up SSL certificate"
echo "3. Configure third-party API keys in Secrets Manager"
echo "4. Test all user flows"
echo "5. Set up monitoring alerts"
echo ""
echo -e "${GREEN}View logs:${NC} amplify console"
echo -e "${GREEN}View API:${NC} amplify console api"
echo ""

#############################################
# Step 9: Run Post-Deployment Tests
#############################################

echo -e "${GREEN}Step 9: Running post-deployment tests...${NC}"

# Simple health check
if curl -s -o /dev/null -w "%{http_code}" https://${CLOUDFRONT_URL} | grep -q "200"; then
    echo "✓ Application is accessible"
else
    echo -e "${YELLOW}⚠ Application may not be fully ready yet. Give it a few minutes.${NC}"
fi

echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Application will be fully available in 2-3 minutes.${NC}"
echo ""

# Save deployment info to file
cat > deployment-info-${ENVIRONMENT}.txt <<EOF
ForwardsFlow Deployment Information
Environment: ${ENVIRONMENT}
Deployed: $(date)

Application URL: https://${CLOUDFRONT_URL}
API Endpoint: ${API_ENDPOINT}
Region: $(aws configure get region)

Amplify Console: https://console.aws.amazon.com/amplify/home?region=$(aws configure get region)#/${APP_ID}
CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=$(aws configure get region)#logsV2:log-groups/log-group/forwardsflow-${ENVIRONMENT}

To update: ./deploy.sh ${ENVIRONMENT}
To rollback: amplify env checkout <previous-env> && amplify publish
EOF

echo -e "${GREEN}Deployment info saved to: deployment-info-${ENVIRONMENT}.txt${NC}"
