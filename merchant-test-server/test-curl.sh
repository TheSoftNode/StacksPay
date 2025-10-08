#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  🧪 Testing StacksPay with cURL                   ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Load .env
export $(cat .env | xargs)

echo -e "${BLUE}API URL:${NC} $STACKSPAY_API_URL"
echo -e "${BLUE}API Key:${NC} ${STACKSPAY_API_KEY:0:30}..."
echo ""

echo -e "${YELLOW}🔄 Creating payment...${NC}"
echo ""

# Create payment
RESPONSE=$(curl -s -X POST http://localhost:4000/api/payments/stx \
  -H "Authorization: Bearer $STACKSPAY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "expectedAmount": 1000000,
    "metadata": "Test payment from cURL",
    "expiresInMinutes": 30,
    "customerEmail": "test@example.com"
  }')

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✅ Payment created successfully!${NC}"
  echo ""
  echo -e "${CYAN}Response:${NC}"
  echo "$RESPONSE" | jq '.'
  echo ""

  # Extract payment ID
  PAYMENT_ID=$(echo "$RESPONSE" | jq -r '.payment.paymentId')
  PAYMENT_LINK=$(echo "$RESPONSE" | jq -r '.payment.paymentLink')

  echo -e "${YELLOW}📱 Payment Link:${NC} $PAYMENT_LINK"
  echo ""

  # Get payment status
  echo -e "${YELLOW}🔍 Checking payment status...${NC}"
  echo ""

  curl -s -X GET "http://localhost:4000/api/payments/stx/$PAYMENT_ID" \
    -H "Authorization: Bearer $STACKSPAY_API_KEY" | jq '.'

else
  echo -e "${RED}❌ Payment creation failed${NC}"
  echo ""
  echo "$RESPONSE" | jq '.'

  if echo "$RESPONSE" | grep -q '401'; then
    echo ""
    echo -e "${YELLOW}💡 Tip: Check your API key in .env file${NC}"
  fi
fi

echo ""
