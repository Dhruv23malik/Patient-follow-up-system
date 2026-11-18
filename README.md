# Patient Follow-up System

A REST API and AI-powered automation workflow for patient follow-up management, built for the **EPIA Backend & AI Automation Internship Technical Assessment**.

## 🎯 Features

### Task 1 - Backend Development (REST API)
- **Create Patient** - Add patients with name, phone, consultation date, and follow-up date
- **List Patients** - Retrieve all patients with pagination and filtering
- **Due Today** - Get patients whose follow-up is due today
- **Complete Follow-up** - Mark patient follow-up as completed
- **Full CRUD** - Update and delete patients
- **Validation** - Comprehensive input validation with Zod
- **Error Handling** - Structured error responses

### Task 2 - AI Automation (WhatsApp Draft Generation)
- **Identify Due Patients** - Automatically finds patients with follow-ups due today
- **AI-Generated Drafts** - Creates personalized WhatsApp messages using OpenAI GPT-4o-mini
- **Staff Review** - Drafts are generated for review before sending
- **Mock Mode** - Works without API key using realistic templates

## 🛠 Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: JSON file store (`data/patients.json`)
- **Validation**: Zod
- **AI**: OpenAI API (with mock fallback)
- **Testing**: Jest + Supertest
- **Logging**: Morgan
- **Security**: Helmet, CORS

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd patient-followup-system
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration (optional - works with defaults)
```

### 3. Run Development Server

```bash
npm run dev
```

Server starts at **http://localhost:3000**

### 4. Run Tests

```bash
npm test
```

### 5. Build for Production

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Health Check
```
GET /health
```

#### Create Patient
```
POST /patients
Content-Type: application/json

{
  "name": "Priya Sharma",
  "phoneNumber": "9876543210",
  "consultationDate": "2024-01-15",
  "nextFollowupDate": "2024-01-22"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Priya Sharma",
    "phoneNumber": "9876543210",
    "consultationDate": "2024-01-15",
    "nextFollowupDate": "2024-01-22",
    "followupStatus": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Get All Patients
```
GET /patients?page=1&limit=20&status=pending&fromDate=2024-01-01&toDate=2024-12-31
```

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

#### Get Patients Due Today
```
GET /patients/due-today
```

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "count": 3
}
```

#### Generate WhatsApp Follow-up Drafts (AI Automation)
```
GET /patients/followup-drafts
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "patientId": "uuid",
      "patientName": "Priya Sharma",
      "phoneNumber": "9876543210",
      "message": "Hi Priya, this is a friendly reminder from EPIA Fertility Clinic about your follow-up today. Please reply CONFIRM or RESCHEDULE. - Team EPIA",
      "generatedAt": "2024-01-22T09:00:00.000Z",
      "status": "draft"
    }
  ],
  "count": 1
}
```

#### Get Single Patient
```
GET /patients/:id
```

#### Update Patient
```
PATCH /patients/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "phoneNumber": "9999999999"
}
```

#### Mark Follow-up Complete
```
PATCH /patients/:id/complete
```

#### Delete Patient
```
DELETE /patients/:id
```

## 🤖 AI Automation Workflow

### How It Works

1. **Trigger**: Staff calls `GET /api/patients/followup-drafts`
2. **Identify**: System queries patients with `next_followup_date = today` AND `followup_status = 'pending'`
3. **Generate**: For each patient, AI creates a personalized WhatsApp message
4. **Review**: Drafts returned with `status: 'draft'` for staff review
5. **Approve/Send**: Staff reviews, approves, then sends via WhatsApp Business API (not implemented - demo only)

### AI Configuration

Set in `.env`:
```env
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
```

**Without API Key**: Uses realistic mock templates with patient name/date substitution.

### Example Generated Message

```
Hi Priya, this is a friendly reminder from EPIA Fertility Clinic about your follow-up scheduled for today. We hope you're doing well! Please reply CONFIRM to confirm or RESCHEDULE to book a new time. - Team EPIA
```

## 🧪 Testing

```bash
# Run all tests with coverage
npm test

# Run specific test file
npm test -- src/services/patientService.test.ts

# Watch mode
npm test -- --watch
```

## 📁 Project Structure

```
patient-followup-system/
├── src/
│   ├── index.ts                 # App entry point
│   ├── database/
│   │   └── jsonStore.ts         # JSON file store (load/save patients)
│   ├── models/
│   │   └── patient.ts           # Zod schemas & TypeScript types
│   ├── services/
│   │   ├── patientService.ts    # Business logic
│   │   └── patientService.test.ts
│   ├── routes/
│   │   └── patientRoutes.ts     # API route handlers
│   ├── ai/
│   │   └── whatsappGenerator.ts # AI WhatsApp draft generation
│   └── middleware/
│       └── errorHandler.ts      # Global error handling
├── data/
│   └── patients.json            # Patient records (auto-created)
├── .env.example                 # Environment template
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## 🔒 Security Considerations

- **Helmet** - Security headers
- **CORS** - Configured for development
- **Input Validation** - All inputs validated with Zod
- **Input Validation** - All inputs validated with Zod; no raw queries (JSON file store)
- **Health Data** - No PHI logged; audit trail via `created_at`/`updated_at`

## 📝 Assessment Notes

### What I Built Personally
- Complete backend architecture (Express + TypeScript + JSON file store)
- Database schema with indexes and triggers
- All REST API endpoints with validation
- AI integration with OpenAI (with mock fallback)
- Comprehensive test suite
- Error handling and logging

### AI Tools Used
- **OpenAI GPT-4o-mini** - For generating personalized WhatsApp messages
- **GitHub Copilot** - Code completion assistance
- **Claude** - Architecture guidance and code review

### Limitations & Future Work
1. **WhatsApp Integration** - Mock only; real integration requires Meta Business API setup
2. **Authentication** - Not implemented (assessment scope)
3. **Rate Limiting** - Could add for production
4. **Webhooks** - For WhatsApp delivery status callbacks
5. **Scheduling** - Could add cron job for automatic daily draft generation

## 📺 Demo Video

[Watch the demo (4 min 30 sec, trimmed)](https://drive.google.com/file/d/1-pdztKAIKA7IAKffg4TsUryTjsa_azIa/view?usp=drivesdk)

Shows: server startup, creating patients via API, listing patients with filters, getting due patients, generating AI WhatsApp drafts, marking follow-up complete, and running tests.

## 📄 License

MIT License - Built for EPIA Technical Assessment

---

**Built with ❤️ for EPIA Fertility Clinic**  
*Making personalized fertility care more accessible and efficient*