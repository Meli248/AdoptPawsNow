import pool from '../../database/index.js';
import { createNotification } from '../notification/notificationController.js';
import { petSchema, updatePetSchema, adoptionApplicationSchema } from '../../validation/schemas.js';

// Get all pets for adoption
export const getAllPets = async (req, res) => {
  try {
    const { species, status = 'available', size, gender, limit, offset } = req.query;

    let query = "SELECT * FROM pets";
    const params = [];
    const conditions = [];

    if (status !== 'all') {
      conditions.push(`LOWER(status) = LOWER($${params.length + 1})`);
      params.push(status);
    }

    if (species) {
      conditions.push(`species = $${params.length + 1}`);
      params.push(species);
    }

    if (size) {
      conditions.push(`size = $${params.length + 1}`);
      params.push(size);
    }

    if (gender) {
      conditions.push(`gender = $${params.length + 1}`);
      params.push(gender);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += ' ORDER BY created_at DESC';

    if (limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(parseInt(limit));
    }

    if (offset) {
      query += ` OFFSET $${params.length + 1}`;
      params.push(parseInt(offset));
    }

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
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

    const result = await pool.query(
      'SELECT * FROM pets WHERE pet_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
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

// Create new pet (for adoption) - FIXED with user_id
export const createPet = async (req, res) => {
  try {
    const userId = req.user?.userId;

    // Get image URL from uploaded file
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

    const {
      name, species, breed, age, gender, size, color, description,
      vaccinated, neutered, status,
      contact_name, contact_email, contact_phone, contact_type,
      location
    } = parsed.data;

    const result = await pool.query(
      `INSERT INTO pets (
        user_id, name, species, breed, age, gender, size, color, description, 
        image_url, vaccinated, neutered, status,
        contact_name, contact_email, contact_phone, contact_type,
        location
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) 
       RETURNING *`,
      [
        userId,  // ✅ ADDED user_id
        name,
        species,
        breed || 'Mixed',
        age || null,
        gender || 'Unknown',
        size || 'Medium',
        color || 'Unknown',
        description,
        image_url,
        vaccinated === 'true' || vaccinated === true,
        neutered === 'true' || neutered === true,
        (status || 'available').toLowerCase(),
        contact_name,
        contact_email,
        contact_phone || null,
        contact_type || 'individual',
        location || 'Not specified'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Pet added successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    console.error('Error details:', error.detail);
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

    const {
      name, species, breed, age, gender, size, color, description,
      status, vaccinated, neutered,
      contact_name, contact_email, contact_phone, contact_type,
      location
    } = parsed.data;

    // Get image URL if new file uploaded
    const image_url = req.file ? `/uploads/${req.file.filename}` : undefined;

    const result = await pool.query(
      `UPDATE pets 
       SET name = COALESCE($1, name),
           species = COALESCE($2, species),
           breed = COALESCE($3, breed),
           age = COALESCE($4, age),
           gender = COALESCE($5, gender),
           size = COALESCE($6, size),
           color = COALESCE($7, color),
           description = COALESCE($8, description),
           image_url = COALESCE($9, image_url),
           status = COALESCE($10, status),
           vaccinated = COALESCE($11, vaccinated),
           neutered = COALESCE($12, neutered),
           contact_name = COALESCE($13, contact_name),
           contact_email = COALESCE($14, contact_email),
           contact_phone = COALESCE($15, contact_phone),
           contact_type = COALESCE($16, contact_type),
           location = COALESCE($17, location),
           updated_at = CURRENT_TIMESTAMP
       WHERE pet_id = $18
       RETURNING *`,
      [
        name, species, breed, age, gender, size, color, description,
        image_url, status,
        vaccinated === 'true' || vaccinated === true,
        neutered === 'true' || neutered === true,
        contact_name, contact_email, contact_phone, contact_type,
        location,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.json({
      success: true,
      message: 'Pet updated successfully',
      data: result.rows[0]
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

    const result = await pool.query(
      'DELETE FROM pets WHERE pet_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
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
    const { pet_id, applicant_name, email, phone, address, reason } = parsed.data;

    // Check if pet exists and is available
    const petCheck = await pool.query(
      'SELECT * FROM pets WHERE pet_id = $1 AND LOWER(status) = $2',
      [pet_id, 'available']
    );

    if (petCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found or not available for adoption'
      });
    }

    const result = await pool.query(
      `INSERT INTO adoption_applications
      (pet_id, applicant_name, email, phone, address, reason)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING * `,
      [pet_id, applicant_name, email, phone, address, reason]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! We will contact you soon.',
      data: result.rows[0]
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

    let query = `
      SELECT a.*, p.name as pet_name, p.species, p.breed, p.image_url as pet_image 
      FROM adoption_applications a
      JOIN pets p ON a.pet_id = p.pet_id
      `;

    const params = [];

    if (status) {
      query += ' WHERE LOWER(a.status) = LOWER($1)';
      params.push(status);
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
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

    const result = await pool.query(
      `SELECT a.*, p.name as pet_name, p.species, p.breed 
       FROM adoption_applications a
       JOIN pets p ON a.pet_id = p.pet_id
       WHERE a.application_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
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

    const result = await pool.query(
      `UPDATE adoption_applications 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE application_id = $2
    RETURNING * `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const application = result.rows[0];

    // If approved, update pet status to 'adopted'
    if (status === 'approved') {
      await pool.query(
        `UPDATE pets SET status = 'adopted' WHERE pet_id = $1`,
        [application.pet_id]
      );
    }

    // Notify the applicant
    try {
      // Find user by email (case-insensitive)
      const userRes = await pool.query('SELECT user_id FROM users WHERE LOWER(email) = LOWER($1)', [application.email]);

      if (userRes.rows.length > 0) {
        const userId = userRes.rows[0].user_id;

        // Get pet info for the notification message and image
        const petRes = await pool.query('SELECT name, image_url FROM pets WHERE pet_id = $1', [application.pet_id]);
        const pet = petRes.rows[0];

        const message = status === 'approved'
          ? `Congratulations! Your adoption application for ${pet.name} has been approved. They are now officially your companion!`
          : `We're sorry, your adoption application for ${pet.name} has been declined at this time.`;

        await createNotification(
          userId,
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

    const result = await pool.query(
      `SELECT * FROM pets 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching user pets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user pets',
      error: error.message
    });
  }
};