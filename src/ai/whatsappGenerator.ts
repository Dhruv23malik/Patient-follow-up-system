import { Patient } from '../models/patient';
import OpenAI from 'openai';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (openai) return openai;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return null;
  }

  openai = new OpenAI({ apiKey });
  return openai;
}

const MOCK_RESPONSES = [
  "Hi {name}, this is a friendly reminder from EPIA Fertility Clinic about your follow-up appointment scheduled for today. We hope you're doing well! Please let us know if you need to reschedule. Reply 'CONFIRM' to confirm or 'RESCHEDULE' to book a new time. - Team EPIA",
  "Hello {name}! Just checking in on your follow-up from your consultation on {consultationDate}. Our team at EPIA wants to make sure everything is going smoothly. Please reply to this message or call us if you have any questions. - EPIA Care Team",
  "Dear {name}, this is a gentle reminder about your follow-up today. We're here to support your journey at EPIA Fertility Clinic. If you've already completed your follow-up, please ignore this message. Otherwise, reply 'DONE' to confirm completion. - EPIA Team",
];

export interface WhatsAppDraft {
  patientId: string;
  patientName: string;
  phoneNumber: string;
  message: string;
  generatedAt: string;
  status: 'draft' | 'approved' | 'rejected' | 'sent';
}

export async function generateFollowupMessage(patient: Patient): Promise<string> {
  const prompt = `You are a helpful assistant at EPIA Fertility Clinic, a women's health and fertility clinic.
Generate a personalized, warm, and professional WhatsApp message for a patient follow-up reminder.

Patient Details:
- Name: ${patient.name}
- Consultation Date: ${patient.consultationDate}
- Follow-up Date: ${patient.nextFollowupDate}

Requirements:
1. Keep it under 160 characters (single SMS/WhatsApp message)
2. Warm, empathetic, and professional tone
3. Include clinic name (EPIA Fertility Clinic)
4. Clear call-to-action (reply CONFIRM, RESCHEDULE, or call)
5. No medical advice - just a reminder
6. Include opt-out instruction

Return ONLY the message text, no explanations.`;

  const client = getOpenAIClient();
  if (!client) {
    // Mock mode - return a template with patient details filled in
    const template = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    return template
      .replace('{name}', patient.name)
      .replace('{consultationDate}', patient.consultationDate)
      .replace('{followupDate}', patient.nextFollowupDate);
  }

  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a professional healthcare communication assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0].message.content?.trim() || MOCK_RESPONSES[0].replace('{name}', patient.name);
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to mock
    const template = MOCK_RESPONSES[0];
    return template.replace('{name}', patient.name).replace('{consultationDate}', patient.consultationDate);
  }
}

export async function generateFollowupDrafts(patients: Patient[]): Promise<WhatsAppDraft[]> {
  const drafts: WhatsAppDraft[] = [];

  for (const patient of patients) {
    const message = await generateFollowupMessage(patient);
    drafts.push({
      patientId: patient.id,
      patientName: patient.name,
      phoneNumber: patient.phoneNumber,
      message,
      generatedAt: new Date().toISOString(),
      status: 'draft',
    });
  }

  return drafts;
}