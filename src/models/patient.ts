import { z } from 'zod';

export const FollowupStatusSchema = z.enum(['pending', 'completed', 'overdue', 'cancelled']);

export const CreatePatientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number too long')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
  consultationDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid consultation date format (use ISO 8601: YYYY-MM-DD)'
  ),
  nextFollowupDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid follow-up date format (use ISO 8601: YYYY-MM-DD)'
  ),
}).refine(
  (data) => new Date(data.nextFollowupDate) >= new Date(data.consultationDate),
  'Follow-up date must be on or after consultation date'
);

export const UpdatePatientSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().min(10).max(15).regex(/^[\d\s\-\+\(\)]+$/).optional(),
  consultationDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  nextFollowupDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  followupStatus: FollowupStatusSchema.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  'At least one field must be provided for update'
);

export const PatientQuerySchema = z.object({
  status: FollowupStatusSchema.optional(),
  fromDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  toDate: z.string().refine((date) => !isNaN(Date.parse(date))).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type Patient = {
  id: string;
  name: string;
  phoneNumber: string;
  consultationDate: string;
  nextFollowupDate: string;
  followupStatus: 'pending' | 'completed' | 'overdue' | 'cancelled';
  createdAt: string;
  updatedAt: string;
};

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;
export type UpdatePatientInput = z.infer<typeof UpdatePatientSchema>;
export type PatientQuery = z.infer<typeof PatientQuerySchema>;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}