const pool = require('../../database');

// Get All Pets (for Adoption page)
const getAllPets = async (req, res) => {
  try {
    const { type, search, status = 'available' } = req.query;

    let query = `
      SELECT p.*, u.full_name as owner_name, u.email as owner_email 
      FROM pets p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.type = 'adoption' AND p.status = $1
    `;
    const values = [status];
    let paramCount = 2;

    if (type && type !== 'all') {
      query += ` AND p.pet_type = $${paramCount}`;
      values.push(type);
      paramCount++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.breed ILIKE $${paramCount} OR p.location ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get all pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get Missing Pets
const getMissingPets = async (req, res) => {
  try {
    const { type, search } = req.query;

    let query = `
      SELECT p.*, u.full_name as owner_name, u.email as owner_email, u.id as owner_id
      FROM pets p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.type = 'missing'
    `;
    const values = [];
    let paramCount = 1;

    if (type && type !== 'all') {
      query += ` AND p.pet_type = $${paramCount}`;
      values.push(type);
      paramCount++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.breed ILIKE $${paramCount} OR p.location ILIKE $${paramCount})`;
      values.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get missing pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get Single Pet Details
const getPetById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, u.full_name as owner_name, u.email as owner_email 
       FROM pets p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Pet not found'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get pet by id error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get Featured Pets (for Home page)
const getFeaturedPets = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, u.full_name as owner_name 
       FROM pets p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.type = 'adoption' AND p.status = 'available' 
       ORDER BY p.created_at DESC 
       LIMIT 6`
    );

    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get featured pets error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get Statistics (for Home/About page)
const getStats = async (req, res) => {
  try {
    const totalAdoptions = await pool.query(
      "SELECT COUNT(*) FROM pets WHERE status = 'adopted'"
    );

    const totalUsers = await pool.query('SELECT COUNT(*) FROM users');

    const missingReunited = await pool.query(
      "SELECT COUNT(*) FROM pets WHERE type = 'missing' AND status = 'reunited'"
    );

    const totalMissing = await pool.query(
      "SELECT COUNT(*) FROM pets WHERE type = 'missing' AND status = 'missing'"
    );

    res.status(200).json({
      success: true,
      data: {
        totalAdoptions: totalAdoptions.rows[0].count,
        totalUsers: totalUsers.rows[0].count,
        missingReunited: missingReunited.rows[0].count,
        totalMissing: totalMissing.rows[0].count
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllPets,
  getMissingPets,
  getPetById,
  getFeaturedPets,
  getStats
};