import {
  createPatient,
  getAllPatients,
  getPatientsDueToday,
  getPatientById,
  updatePatient,
  markFollowupComplete,
  deletePatient,
} from './patientService';
import { Patient } from '../models/patient';

describe('Patient Service', () => {
  const testPatient = {
    name: 'Test Patient',
    phoneNumber: '9876543210',
    consultationDate: '2024-01-15',
    nextFollowupDate: '2024-01-22',
  };

  beforeEach(() => {
    // Clear database before each test by deleting the JSON file
    const fs = require('fs');
    const path = require('path');
    const dataFile = path.join(process.cwd(), 'data', 'patients.json');
    if (fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, '[]');
    }
  });

  describe('createPatient', () => {
    it('should create a new patient', () => {
      const patient = createPatient(testPatient);
      expect(patient).toBeDefined();
      expect(patient.id).toBeDefined();
      expect(patient.name).toBe(testPatient.name);
      expect(patient.phoneNumber).toBe(testPatient.phoneNumber);
      expect(patient.consultationDate).toBe(testPatient.consultationDate);
      expect(patient.nextFollowupDate).toBe(testPatient.nextFollowupDate);
      expect(patient.followupStatus).toBe('pending');
    });

    it('should create multiple patients', () => {
      const p1 = createPatient({ ...testPatient, name: 'Patient 1' });
      const p2 = createPatient({ ...testPatient, name: 'Patient 2' });
      expect(p1.id).not.toBe(p2.id);
    });
  });

  describe('getAllPatients', () => {
    it('should return all patients with pagination', () => {
      createPatient({ ...testPatient, name: 'Patient A' });
      createPatient({ ...testPatient, name: 'Patient B' });
      createPatient({ ...testPatient, name: 'Patient C' });

      const result = getAllPatients({ page: 1, limit: 2 });
      expect(result.data).toHaveLength(2);
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });

    it('should filter by status', () => {
      const p1 = createPatient({ ...testPatient, name: 'Patient 1' });
      createPatient({ ...testPatient, name: 'Patient 2' });
      markFollowupComplete(p1.id);

      const result = getAllPatients({ status: 'completed', page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].followupStatus).toBe('completed');
    });

    it('should filter by date range', () => {
      createPatient({ ...testPatient, name: 'Patient 1', nextFollowupDate: '2024-01-20' });
      createPatient({ ...testPatient, name: 'Patient 2', nextFollowupDate: '2024-01-25' });
      createPatient({ ...testPatient, name: 'Patient 3', nextFollowupDate: '2024-02-01' });

      const result = getAllPatients({ fromDate: '2024-01-20', toDate: '2024-01-25', page: 1, limit: 20 });
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getPatientsDueToday', () => {
    it('should return patients with follow-up due today', () => {
      const today = new Date().toISOString().split('T')[0];
      createPatient({ ...testPatient, name: 'Due Today', nextFollowupDate: today });
      createPatient({ ...testPatient, name: 'Due Tomorrow', nextFollowupDate: '2099-12-31' });
      const completedPatient = createPatient({ ...testPatient, name: 'Completed', nextFollowupDate: today });
      markFollowupComplete(completedPatient.id);

      const due = getPatientsDueToday();
      expect(due).toHaveLength(1);
      expect(due[0].name).toBe('Due Today');
    });
  });

  describe('getPatientById', () => {
    it('should return patient by id', () => {
      const created = createPatient(testPatient);
      const found = getPatientById(created.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should return null for non-existent id', () => {
      const found = getPatientById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('updatePatient', () => {
    it('should update patient fields', () => {
      const created = createPatient(testPatient);
      const updated = updatePatient(created.id, { name: 'Updated Name', phoneNumber: '5555555555' });
      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.phoneNumber).toBe('5555555555');
    });

    it('should return null for non-existent id', () => {
      const updated = updatePatient('non-existent-id', { name: 'New Name' });
      expect(updated).toBeNull();
    });
  });

  describe('markFollowupComplete', () => {
    it('should mark follow-up as completed', () => {
      const created = createPatient(testPatient);
      const updated = markFollowupComplete(created.id);
      expect(updated).toBeDefined();
      expect(updated?.followupStatus).toBe('completed');
    });
  });

  describe('deletePatient', () => {
    it('should delete patient', () => {
      const created = createPatient(testPatient);
      const deleted = deletePatient(created.id);
      expect(deleted).toBe(true);

      const found = getPatientById(created.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent id', () => {
      const deleted = deletePatient('non-existent-id');
      expect(deleted).toBe(false);
    });
  });
});