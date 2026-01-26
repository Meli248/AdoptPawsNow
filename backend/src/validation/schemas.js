import { z } from 'zod';

export const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  breed: z.string().optional(),
  type: z.enum(['adoption', 'missing'], {
    required_error: 'Type must be either adoption or missing'
  }),
  petType: z.string().optional(),
  age: z.number().int().positive().optional(),
  location: z.string().min(1, 'Location is required'),
  description: z.string().optional(),
  status: z.enum(['available', 'adopted', 'pending']).default('available'),
  image: z.string().url().optional().or(z.literal(''))
});

export const updatePetSchema = z.object({
  name: z.string().min(1).optional(),
  breed: z.string().optional(),
  type: z.enum(['adoption', 'missing']).optional(),
  petType: z.string().optional(),
  age: z.number().int().positive().optional(),
  location: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['available', 'adopted', 'pending']).optional(),
  image: z.string().url().optional().or(z.literal(''))
});


