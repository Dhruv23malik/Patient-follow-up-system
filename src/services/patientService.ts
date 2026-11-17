import {
  createPatient as dbCreatePatient,
  getAllPatients as dbGetAllPatients,
  getPatientsDueToday as dbGetPatientsDueToday,
  getPatientById as dbGetPatientById,
  updatePatient as dbUpdatePatient,
  markFollowupComplete as dbMarkFollowupComplete,
  deletePatient as dbDeletePatient,
} from '../database/jsonStore';
import { Patient, CreatePatientInput, UpdatePatientInput, PatientQuery, PaginatedResponse } from '../models/patient';

export const createPatient = dbCreatePatient;
export const getAllPatients = dbGetAllPatients;
export const getPatientsDueToday = dbGetPatientsDueToday;
export const getPatientById = dbGetPatientById;
export const updatePatient = dbUpdatePatient;
export const markFollowupComplete = dbMarkFollowupComplete;
export const deletePatient = dbDeletePatient;