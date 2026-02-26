import { z } from 'zod';

/* ======================================
   AUTH SCHEMAS
====================================== */
export const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  email: z.string()
    .email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  username: z.string().min(2, 'Username must be at least 2 characters').optional(),
  phone: z.string().max(20, 'Phone must not exceed 20 characters').optional().nullable(),
  location: z.string().max(200, 'Location must not exceed 200 characters').optional().nullable(),
});

/* ======================================
   PET SCHEMAS
====================================== */
export const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required').max(100),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().max(100).optional(),
  age: z.union([z.string(), z.number()]).optional(),
  gender: z.enum(['Male', 'Female', 'Unknown']).optional(),
  size: z.enum(['Small', 'Medium', 'Large', 'Extra Large']).optional(),
  color: z.string().max(50).optional(),
  description: z.string().optional(),
  vaccinated: z.union([z.boolean(), z.string()]).optional(),
  neutered: z.union([z.boolean(), z.string()]).optional(),
  status: z.enum(['available', 'adopted', 'pending']).default('available'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Contact email must be valid'),
  contact_phone: z.string().max(20).optional(),
  contact_type: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
});

export const updatePetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  species: z.string().optional(),
  breed: z.string().max(100).optional(),
  age: z.union([z.string(), z.number()]).optional(),
  gender: z.enum(['Male', 'Female', 'Unknown']).optional(),
  size: z.enum(['Small', 'Medium', 'Large', 'Extra Large']).optional(),
  color: z.string().max(50).optional(),
  description: z.string().optional(),
  vaccinated: z.union([z.boolean(), z.string()]).optional(),
  neutered: z.union([z.boolean(), z.string()]).optional(),
  status: z.enum(['available', 'adopted', 'pending']).optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().max(20).optional(),
  contact_type: z.string().optional(),
  location: z.string().optional(),
});

/* ======================================
   ADOPTION APPLICATION SCHEMA
====================================== */
export const adoptionApplicationSchema = z.object({
  pet_id: z.union([z.string(), z.number()]).refine(v => !isNaN(Number(v)), {
    message: 'Pet ID is required',
  }),
  applicant_name: z.string().min(1, 'Applicant name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(20).optional(),
  address: z.string().optional(),
  reason: z.string().optional(),
});

/* ======================================
   SURRENDER REQUEST SCHEMA
====================================== */
export const surrenderRequestSchema = z.object({
  pet_name: z.string().min(1, 'Pet name is required'),
  pet_type: z.string().min(1, 'Pet type is required'),
  breed: z.string().optional(),
  age: z.union([z.string(), z.number()]).optional(),
  gender: z.string().optional(),
  reason: z.string().min(1, 'Reason is required'),
  contact_name: z.string().optional(),
  contact_email: z.string().email('Contact email must be valid').optional().or(z.literal('')),
  contact_phone: z.string().max(20).optional(),
  location: z.string().min(1, 'Location is required'),
});
