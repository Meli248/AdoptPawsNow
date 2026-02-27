import { createNotification } from '../notification/notificationController.js';
import { petSchema, updatePetSchema, adoptionApplicationSchema } from '../../validation/schemas.js';
import Pet from '../../models/Pet.js';
import Application from '../../models/Application.js';
import User from '../../models/User.js';

// Get all pets for adoption
export const getAllPets = async (req, res) => {
  try {
    const { species, status, size, gender, limit, offset } = req.query;

    const result = await Pet.findAll({ species, status, size, gender, limit, offset });

    res.json({
      success: true,
      data: result.rows,
      count: result.count
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pets',
      error: error.message
    });
  }
};

// Get single pet by ID
export const getPetById = async (req, res) => {
  try {
    const { id } = req.params;

    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.json({
      success: true,
      data: pet
    });
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pet',
      error: error.message
    });
  }
};

// Create new pet (for adoption)
export const createPet = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!image_url) {
      return res.status(400).json({ success: false, message: 'Pet image is required' });
    }

    const parsed = petSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: parsed.error.errors
      });
    }

    const pet = await Pet.create({
      userId,
      image_url,
      ...parsed.data
    });

    res.status(201).json({
      success: true,
      message: 'Pet added successfully',
      data: pet
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add pet',
      error: error.message
    });
  }
};

// Update pet
export const updatePet = async (req, res) => {
  try {
    const { id } = req.params;

    const parsed = updatePetSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: parsed.error.errors
      });
    }

    const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updatedPet = await Pet.update(id, {
      image_url,
      ...parsed.data
    });

    if (!updatedPet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: updatedPet
    });
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update pet',
      error: error.message
    });
  }
};

// Delete pet
export const deletePet = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPet = await Pet.delete(id);

    if (!deletedPet) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.json({
      success: true,
      message: 'Pet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete pet',
      error: error.message
    });
  }
};

// Submit adoption application
export const createAdoptionApplication = async (req, res) => {
  try {
    const parsed = adoptionApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: parsed.error.errors
      });
    }

    // Check if pet exists and is available
    const pet = await Pet.findById(parsed.data.pet_id);

    if (!pet || pet.status.toLowerCase() !== 'available') {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or not available for adoption'
      });
    }

    const application = await Application.create(parsed.data);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! We will contact you soon.',
      data: application
    });
  } catch (error) {
    console.error('Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// Get all applications (for admin)
export const getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;

    const result = await Application.findAll({ status });

    res.json({
      success: true,
      data: result.rows,
      count: result.count
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Get application by ID
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    const application = await Application.updateStatus(id, status);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // If approved, update pet status to 'adopted'
    if (status === 'approved') {
      await Pet.updateStatus(application.pet_id, 'adopted');
    }

    // Notify the applicant
    try {
      const user = await User.findByEmail(application.email);

      if (user) {
        const pet = await Pet.findById(application.pet_id);

        const message = status === 'approved'
          ? `Congratulations! Your adoption application for ${pet.name} has been approved. They are now officially your companion!`
          : `We're sorry, your adoption application for ${pet.name} has been declined at this time.`;

        await createNotification(
          user.user_id,
          message,
          'adoption_update',
          pet.image_url
        );
      }
    } catch (notifError) {
      console.error('Error sending adoption notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
};

// Get user's pets - FOR PROFILE PAGE
export const getUserPets = async (req, res) => {
  try {
    const userId = req.user.userId;

    const pets = await Pet.findByUserId(userId);

    res.json({
      success: true,
      data: pets,
      count: pets.length
    });
  } catch (error) {
    console.error('Error fetching user pets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user pets'
    });
  }
};