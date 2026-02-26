import axios from 'axios';

// Configure your API base URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for handling auth tokens
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('access_token');
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
      // Handle 401 Unauthorized - token expired or invalid
      if (error.response.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        window.dispatchEvent(new Event('storage'));
        window.location.href = '/login';
      }

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
    return await apiClient.post('/pets/applications', data);
  },

  // Get all applications
  getAllApplications: async (params = {}) => {
    return await apiClient.get('/pets/applications', { params });
  },

  // Get application by ID
  getApplicationById: async (id) => {
    return await apiClient.get(`/pets/applications/${id}`);
  },

  // Update application status
  updateApplicationStatus: async (id, status) => {
    return await apiClient.patch(`/pets/applications/${id}/status`, { status });
  },
};

// ============================================
// MISSING PETS API
// ============================================
export const missingAPI = {
  // Get all missing pets
  getAllMissingPets: async (params = {}) => {
    return await apiClient.get('/missing/missing-pets', { params });
  },

  // Get single missing pet by ID
  getMissingPetById: async (id) => {
    return await apiClient.get(`/missing/missing-pets/${id}`);
  },

  // Create missing pet report (with image upload)
  createMissingPet: async (formData) => {
    return await apiClient.post('/missing/missing-pets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update missing pet
  updateMissingPet: async (id, formData) => {
    return await apiClient.put(`/missing/missing-pets/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete missing pet report
  deleteMissingPet: async (id) => {
    return await apiClient.delete(`/missing/missing-pets/${id}`);
  },

  // Report sighting
  reportSighting: async (data) => {
    return await apiClient.post('/missing/sightings', data);
  },

  // Get sightings for a missing pet
  getSightings: async (missingPetId) => {
    return await apiClient.get(`/missing/missing-pets/${missingPetId}/sightings`);
  },

  // Get all sightings
  getAllSightings: async () => {
    return await apiClient.get('/missing/sightings');
  },

  // Update pet status (found/still missing)
  updateStatus: async (id, status) => {
    return await apiClient.patch(`/missing/missing-pets/${id}/status`, { status });
  },
};

// ============================================
// AUTH API
// ============================================
export const authAPI = {
  // Register
  register: async (data) => {
    return await apiClient.post('/auth/register', data);
  },

  // Login
  login: async (data) => {
    const response = await apiClient.post('/auth/login', data);
    if (response.data && response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', response.data.user.username);
    }
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
  },

  // Get current user
  getCurrentUser: async () => {
    return await apiClient.get('/auth/me');
  },
};

export default apiClient;