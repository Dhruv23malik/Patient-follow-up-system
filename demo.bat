@echo off
REM Demo script for Patient Follow-up System (Windows)
REM Run this to demonstrate the full workflow

echo =========================================
echo Patient Follow-up System - Demo
echo =========================================
echo.

set BASE_URL=http://localhost:3000

echo 1. Health Check
curl -s %BASE_URL%/health
echo.
echo.

echo 2. Create Patients
echo Creating Priya Sharma (follow-up in future)...
curl -s -X POST %BASE_URL%/api/patients -H "Content-Type: application/json" -d "{\"name\": \"Priya Sharma\", \"phoneNumber\": \"9876543210\", \"consultationDate\": \"2024-01-15\", \"nextFollowupDate\": \"2024-01-22\"}"
echo.
echo.

echo Creating Anita Patel (follow-up DUE TODAY)...
curl -s -X POST %BASE_URL%/api/patients -H "Content-Type: application/json" -d "{\"name\": \"Anita Patel\", \"phoneNumber\": \"8765432109\", \"consultationDate\": \"2024-01-10\", \"nextFollowupDate\": \"%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%\"}"
echo.
echo.

echo Creating Rajesh Kumar (follow-up DUE TODAY)...
curl -s -X POST %BASE_URL%/api/patients -H "Content-Type: application/json" -d "{\"name\": \"Rajesh Kumar\", \"phoneNumber\": \"7654321098\", \"consultationDate\": \"2024-01-05\", \"nextFollowupDate\": \"%DATE:~10,4%-%DATE:~4,2%-%DATE:~7,2%\"}"
echo.
echo.

echo 3. Get All Patients
curl -s %BASE_URL%/api/patients
echo.
echo.

echo 4. Get Patients Due Today
curl -s %BASE_URL%/api/patients/due-today
echo.
echo.

echo 5. Generate AI WhatsApp Follow-up Drafts
curl -s %BASE_URL%/api/patients/followup-drafts
echo.
echo.

echo 6. Mark Follow-up Complete (first due patient)
REM Note: You'll need to manually get the patient ID from step 4
echo "Run: curl -X PATCH %BASE_URL%/api/patients/<PATIENT_ID>/complete"
echo.
echo.

echo =========================================
echo Demo Complete!
echo =========================================