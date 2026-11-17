import { mkdirSync } from 'fs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Patient, CreatePatientInput, UpdatePatientInput, PatientQuery, PaginatedResponse } from '../models/patient';

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'patients.json');

mkdirSync(DATA_DIR, { recursive: true });

function loadPatients(): Patient[] {
  if (!existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const data = readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function savePatients(patients: Patient[]): void {
  writeFileSync(DATA_FILE, JSON.stringify(patients, null, 2));
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function createPatient(input: CreatePatientInput): Patient {
  const patients = loadPatients();
  const now = new Date().toISOString();

  const patient: Patient = {
    id: uuidv4(),
    name: input.name,
    phoneNumber: input.phoneNumber,
    consultationDate: input.consultationDate,
    nextFollowupDate: input.nextFollowupDate,
    followupStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  patients.push(patient);
  savePatients(patients);
  return patient;
}

export function getAllPatients(query: PatientQuery): PaginatedResponse<Patient> {
  const { page = 1, limit = 20, status, fromDate, toDate } = query;
  let patients = loadPatients();

  if (status) {
    patients = patients.filter(p => p.followupStatus === status);
  }
  if (fromDate) {
    patients = patients.filter(p => p.nextFollowupDate >= fromDate);
  }
  if (toDate) {
    patients = patients.filter(p => p.nextFollowupDate <= toDate);
  }

  patients.sort((a, b) => a.nextFollowupDate.localeCompare(b.nextFollowupDate));

  const total = patients.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const data = patients.slice(offset, offset + limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export function getPatientsDueToday(): Patient[] {
  const today = getTodayISO();
  const patients = loadPatients();
  return patients.filter(p =>
    p.nextFollowupDate === today && p.followupStatus === 'pending'
  );
}

export function getPatientById(id: string): Patient | null {
  const patients = loadPatients();
  return patients.find(p => p.id === id) || null;
}

export function updatePatient(id: string, input: UpdatePatientInput): Patient | null {
  const patients = loadPatients();
  const index = patients.findIndex(p => p.id === id);

  if (index === -1) return null;

  const updated: Patient = {
    ...patients[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };

  patients[index] = updated;
  savePatients(patients);
  return updated;
}

export function markFollowupComplete(id: string): Patient | null {
  return updatePatient(id, { followupStatus: 'completed' });
}

export function deletePatient(id: string): boolean {
  const patients = loadPatients();
  const filtered = patients.filter(p => p.id !== id);

  if (filtered.length === patients.length) return false;

  savePatients(filtered);
  return true;
}