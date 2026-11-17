import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createPatient,
  getAllPatients,
  getPatientsDueToday,
  getPatientById,
  updatePatient,
  markFollowupComplete,
  deletePatient,
} from '../services/patientService';
import {
  CreatePatientSchema,
  UpdatePatientSchema,
  PatientQuerySchema,
} from '../models/patient';
import { generateFollowupDrafts } from '../ai/whatsappGenerator';

const router = Router();

// Validation middleware
const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    });
  }
  req.body = result.data;
  next();
};

const validateQuery = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: result.error.flatten().fieldErrors,
    });
  }
  req.query = result.data as any;
  next();
};

// POST /api/patients - Create a new patient
router.post('/', validate(CreatePatientSchema), async (req: Request, res: Response) => {
  try {
    const patient = createPatient(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

// GET /api/patients - Get all patients with pagination and filters
router.get('/', validateQuery(PatientQuerySchema), async (req: Request, res: Response) => {
  try {
    const result = getAllPatients(req.query as any);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// GET /api/patients/due-today - Get patients with follow-up due today
router.get('/due-today', async (req: Request, res: Response) => {
  try {
    const patients = getPatientsDueToday();
    res.json({ success: true, data: patients, count: patients.length });
  } catch (error) {
    console.error('Error fetching due patients:', error);
    res.status(500).json({ error: 'Failed to fetch due patients' });
  }
});

// GET /api/patients/followup-drafts - Generate WhatsApp drafts for due patients
router.get('/followup-drafts', async (req: Request, res: Response) => {
  try {
    const patients = getPatientsDueToday();
    const drafts = await generateFollowupDrafts(patients);
    res.json({ success: true, data: drafts, count: drafts.length });
  } catch (error) {
    console.error('Error generating drafts:', error);
    res.status(500).json({ error: 'Failed to generate follow-up drafts' });
  }
});

// GET /api/patients/:id - Get a single patient
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const patient = getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// PATCH /api/patients/:id - Update a patient
router.patch('/:id', validate(UpdatePatientSchema), async (req: Request, res: Response) => {
  try {
    const patient = updatePatient(req.params.id, req.body);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// PATCH /api/patients/:id/complete - Mark follow-up as completed
router.patch('/:id/complete', async (req: Request, res: Response) => {
  try {
    const patient = markFollowupComplete(req.params.id);
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ success: true, data: patient, message: 'Follow-up marked as completed' });
  } catch (error) {
    console.error('Error completing follow-up:', error);
    res.status(500).json({ error: 'Failed to complete follow-up' });
  }
});

// DELETE /api/patients/:id - Delete a patient
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = deletePatient(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

export default router;