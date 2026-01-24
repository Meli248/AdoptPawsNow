const { z } = require('zod');

// Auth Schemas
const registerSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters'),
  confirmPassword: z.string().optional()
}).refine((data) => {
  if (data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(1, 'Password is required')
});

// Pet Schemas
const petSchema = z.object({
  name: z.string()
    .min(1, 'Pet name is required')
    .max(100, 'Pet name must not exceed 100 characters'),
  breed: z.string()
    .min(1, 'Breed is required')
    .max(100, 'Breed must not exceed 100 characters'),
  type: z.enum(['adoption', 'missing'], {
    errorMap: () => ({ message: 'Type must be either adoption or missing' })
  }),
  petType: z.enum(['dog', 'cat'], {
    errorMap: () => ({ message: 'Pet type must be either dog or cat' })
  }),
  age: z.string()
    .min(1, 'Age is required'),
  location: z.string()
    .min(1, 'Location is required')
    .max(200, 'Location must not exceed 200 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  status: z.enum(['available', 'pending', 'adopted', 'missing', 'reunited'])
    .default('available'),
  image: z.string()
    .url('Invalid image URL')
    .optional()
});

const updatePetSchema = z.object({
  name: z.string()
    .min(1, 'Pet name is required')
    .max(100, 'Pet name must not exceed 100 characters')
    .optional(),
  breed: z.string()
    .min(1, 'Breed is required')
    .max(100, 'Breed must not exceed 100 characters')
    .optional(),
  type: z.enum(['adoption', 'missing'])
    .optional(),
  petType: z.enum(['dog', 'cat'])
    .optional(),
  age: z.string()
    .optional(),
  location: z.string()
    .max(200, 'Location must not exceed 200 characters')
    .optional(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .optional(),
  status: z.enum(['available', 'pending', 'adopted', 'missing', 'reunited'])
    .optional(),
  image: z.string()
    .url('Invalid image URL')
    .optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  petSchema,
  updatePetSchema
};