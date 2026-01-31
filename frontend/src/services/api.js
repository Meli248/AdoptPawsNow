import axios from 'axios';

// Configure your API base URL here
const API_BASE_URL = 'http://localhost:5000/api'; // Change this to your backend URL

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for handling auth tokens (if needed)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      throw {
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request made but no response
      throw {
        message: 'No response from server. Please check your connection.',
      };
    } else {
      // Something else happened
      throw {
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
);

// ============================================
// ADOPTION PETS API
// ============================================
export const adoptionAPI = {
  // Get all pets for adoption
  getAllPets: async (params = {}) => {
    return await apiClient.get('/pets', { params });
  },

  // Get single pet by ID
  getPetById: async (id) => {
    return await apiClient.get(`/pets/${id}`);
  },

  // Create new pet for adoption (with image upload)
  createPet: async (formData) => {
    return await apiClient.post('/pets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update pet
  updatePet: async (id, formData) => {
    return await apiClient.put(`/pets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete pet
  deletePet: async (id) => {
    return await apiClient.delete(`/pets/${id}`);
  },

  // Create adoption application
  createApplication: async (data) => {
    return await apiClient.post('/applications', data);
  },

  // Get applications for a pet
  getApplications: async (petId) => {
    return await apiClient.get(`/pets/${petId}/applications`);
  },
};

// ============================================
// MISSING PETS API
// ============================================
export const missingAPI = {
  // Get all missing pets
  getAllMissingPets: async (params = {}) => {
    return await apiClient.get('/missing-pets', { params });
  },

  // Get single missing pet by ID
  getMissingPetById: async (id) => {
    return await apiClient.get(`/missing-pets/${id}`);
  },

  // Create missing pet report (with image upload)
  createMissingPet: async (formData) => {
    return await apiClient.post('/missing-pets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update missing pet
  updateMissingPet: async (id, formData) => {
    return await apiClient.put(`/missing-pets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete missing pet report
  deleteMissingPet: async (id) => {
    return await apiClient.delete(`/missing-pets/${id}`);
  },

  // Report sighting
  reportSighting: async (data) => {
    return await apiClient.post('/sightings', data);
  },

  // Get sightings for a missing pet
  getSightings: async (missingPetId) => {
    return await apiClient.get(`/missing-pets/${missingPetId}/sightings`);
  },

  // Update pet status (found/still missing)
  updateStatus: async (id, status) => {
    return await apiClient.patch(`/missing-pets/${id}/status`, { status });
  },
};

// ============================================
// USER API (Optional - if you have authentication)
// ============================================
export const userAPI = {
  // Register
  register: async (data) => {
    return await apiClient.post('/auth/register', data);
  },

  // Login
  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },

  // Get current user
  getCurrentUser: async () => {
    return await apiClient.get('/auth/me');
  },
};

export default apiClient;