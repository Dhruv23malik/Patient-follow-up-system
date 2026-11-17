#!/bin/bash
# Demo script for Patient Follow-up System
# Run this to demonstrate the full workflow

set -e

echo "========================================="
echo "Patient Follow-up System - Demo"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

echo -e "${BLUE}1. Health Check${NC}"
curl -s $BASE_URL/health | jq .
echo ""

echo -e "${BLUE}2. Create Patients${NC}"
echo "Creating Priya Sharma (follow-up in future)..."
curl -s -X POST $BASE_URL/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name": "Priya Sharma", "phoneNumber": "9876543210", "consultationDate": "2024-01-15", "nextFollowupDate": "2024-01-22"}' | jq .
echo ""

echo "Creating Anita Patel (follow-up DUE TODAY)..."
curl -s -X POST $BASE_URL/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name": "Anita Patel", "phoneNumber": "8765432109", "consultationDate": "2024-01-10", "nextFollowupDate": "'$(date +%Y-%m-%d)'"}' | jq .
echo ""

echo "Creating Rajesh Kumar (follow-up DUE TODAY)..."
curl -s -X POST $BASE_URL/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name": "Rajesh Kumar", "phoneNumber": "7654321098", "consultationDate": "2024-01-05", "nextFollowupDate": "'$(date +%Y-%m-%d)'"}' | jq .
echo ""

echo -e "${BLUE}3. Get All Patients${NC}"
curl -s $BASE_URL/api/patients | jq .
echo ""

echo -e "${BLUE}4. Get Patients Due Today${NC}"
curl -s $BASE_URL/api/patients/due-today | jq .
echo ""

echo -e "${BLUE}5. Generate AI WhatsApp Follow-up Drafts${NC}"
curl -s $BASE_URL/api/patients/followup-drafts | jq .
echo ""

echo -e "${BLUE}6. Mark Follow-up Complete${NC}"
# Get the first due patient ID
PATIENT_ID=$(curl -s $BASE_URL/api/patients/due-today | jq -r '.data[0].id')
echo "Marking patient $PATIENT_ID as complete..."
curl -s -X PATCH $BASE_URL/api/patients/$PATIENT_ID/complete | jq .
echo ""

echo -e "${BLUE}7. Verify Follow-up Marked Complete${NC}"
curl -s $BASE_URL/api/patients/due-today | jq .
echo ""

echo -e "${GREEN}========================================="
echo "Demo Complete!"
echo "=========================================${NC}"