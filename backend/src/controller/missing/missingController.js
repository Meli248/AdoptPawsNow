import pool from '../../database/index.js';

// Get all missing pets
export const getAllMissingPets = async (req, res) => {
  try {
    const { species, status = 'missing' } = req.query;
    
    let query = 'SELECT * FROM missing_pets WHERE LOWER(status) = LOWER($1)';
    const params = [status];
    
    if (species) {
      query += ' AND species = $2';
      params.push(species);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching missing pets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch missing pets',
      error: error.message
    });
  }
};

// Get single missing pet by ID
export const getMissingPetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM missing_pets WHERE missing_id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Missing pet not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching missing pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch missing pet',
      error: error.message
    });
  }
};

// Report a missing pet - FIXED
export const reportMissingPet = async (req, res) => {
  try {
    const {
      pet_name, species, breed, age, gender, color, description,
      last_seen_location, last_seen_date,
      owner_name, owner_email, owner_phone, reward, status
    } = req.body;

    // Get image URL from uploaded file
    const image_url = req.file 
      ? `/uploads/${req.file.filename}` 
      : null;

    // Validate required fields
    if (!pet_name || !species || !last_seen_location || 
        !last_seen_date || !owner_name || !owner_email) {
      return res.status(400).json({
        success: false,
        message: 'Pet name, species, last seen location, last seen date, owner name, and owner email are required'
      });
    }

    if (!image_url) {
      return res.status(400).json({
        success: false,
        message: 'Pet image is required'
      });
    }

    const result = await pool.query(
      `INSERT INTO missing_pets 
       (pet_name, species, breed, age, gender, color, description, 
        last_seen_location, last_seen_date, image_url, 
        owner_name, owner_email, owner_phone, reward, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
       RETURNING *`,
      [
        pet_name, 
        species, 
        breed || 'Unknown', 
        age || null, 
        gender || 'Unknown', 
        color || null, 
        description,
        last_seen_location, 
        last_seen_date, 
        image_url,
        owner_name, 
        owner_email, 
        owner_phone || null,
        reward || null,
        (status || 'missing').toLowerCase()  // FIXED: Force lowercase
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Missing pet reported successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error reporting missing pet:', error);
    console.error('Error details:', error.detail);
    res.status(500).json({
      success: false,
      message: 'Failed to report missing pet',
      error: error.message
    });
  }
};

// Update missing pet
export const updateMissingPet = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      pet_name, species, breed, age, gender, color, description,
      last_seen_location, last_seen_date, status, reward
    } = req.body;

    // Get image URL if new file uploaded
    const image_url = req.file 
      ? `/uploads/${req.file.filename}` 
      : undefined;

    const result = await pool.query(
      `UPDATE missing_pets 
       SET pet_name = COALESCE($1, pet_name),
           species = COALESCE($2, species),
           breed = COALESCE($3, breed),
           age = COALESCE($4, age),
           gender = COALESCE($5, gender),
           color = COALESCE($6, color),
           description = COALESCE($7, description),
           last_seen_location = COALESCE($8, last_seen_location),
           last_seen_date = COALESCE($9, last_seen_date),
           image_url = COALESCE($10, image_url),
           status = COALESCE($11, status),
           reward = COALESCE($12, reward),
           updated_at = CURRENT_TIMESTAMP
       WHERE missing_id = $13
       RETURNING *`,
      [
        pet_name, species, breed, age, gender, color, description,
        last_seen_location, last_seen_date, image_url, 
        status ? status.toLowerCase() : undefined, 
        reward, id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Missing pet not found'
      });
    }

    res.json({
      success: true,
      message: 'Missing pet updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating missing pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update missing pet',
      error: error.message
    });
  }
};

// Delete missing pet report
export const deleteMissingPet = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM missing_pets WHERE missing_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Missing pet not found'
      });
    }

    res.json({
      success: true,
      message: 'Missing pet report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting missing pet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete missing pet',
      error: error.message
    });
  }
};

// Get sightings for a missing pet
export const getSightingsForPet = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT * FROM sightings 
       WHERE missing_id = $1 
       ORDER BY sighting_date DESC, created_at DESC`,
      [id]
    );
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching sightings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sightings',
      error: error.message
    });
  }
};

// Report a sighting
export const reportSighting = async (req, res) => {
  try {
    const {
      missing_id, location, sighting_date, description,
      reporter_name, reporter_email, reporter_phone
    } = req.body;

    // Validate required fields
    if (!missing_id || !location || !sighting_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing ID, location, and sighting date are required'
      });
    }

    // Check if missing pet exists
    const petCheck = await pool.query(
      'SELECT * FROM missing_pets WHERE missing_id = $1',
      [missing_id]
    );

    if (petCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Missing pet not found'
      });
    }

    const result = await pool.query(
      `INSERT INTO sightings 
       (missing_id, location, sighting_date, description, 
        reporter_name, reporter_email, reporter_phone) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [missing_id, location, sighting_date, description,
       reporter_name, reporter_email, reporter_phone]
    );

    res.status(201).json({
      success: true,
      message: 'Sighting reported successfully! Owner will be notified.',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error reporting sighting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report sighting',
      error: error.message
    });
  }
};

// Get all sightings (admin)
export const getAllSightings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, m.pet_name, m.species, m.owner_name, m.owner_email 
       FROM sightings s
       JOIN missing_pets m ON s.missing_id = m.missing_id
       ORDER BY s.created_at DESC`
    );
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching all sightings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sightings',
      error: error.message
    });
  }
};

// Update missing pet status
export const updateMissingPetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['missing', 'found', 'closed'].includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be missing, found, or closed'
      });
    }

    const result = await pool.query(
      `UPDATE missing_pets 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE missing_id = $2 
       RETURNING *`,
      [status.toLowerCase(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Missing pet not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message
    });
  }
};