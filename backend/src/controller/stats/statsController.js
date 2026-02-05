import pool from '../../database/index.js';

/* ======================================
   GET HOME PAGE STATISTICS
====================================== */
export const getHomeStats = async (req, res) => {
  try {
    // Count adopted pets (all species)
    const adoptedPets = await pool.query(
      `SELECT COUNT(*) FROM pets WHERE LOWER(status) = 'adopted'`
    );

    // Count reunited/found pets
    const reunitedPets = await pool.query(
      `SELECT COUNT(*) FROM missing_pets WHERE LOWER(status) = 'found'`
    );

    // Count all dogs (both available and adopted)
    const dogsCount = await pool.query(
      `SELECT COUNT(*) FROM pets WHERE LOWER(species) = 'dog'`
    );

    // Count all cats (both available and adopted)
    const catsCount = await pool.query(
      `SELECT COUNT(*) FROM pets WHERE LOWER(species) = 'cat'`
    );

    // Additional useful stats
    const availablePets = await pool.query(
      `SELECT COUNT(*) FROM pets WHERE LOWER(status) = 'available'`
    );

    const missingPets = await pool.query(
      `SELECT COUNT(*) FROM missing_pets WHERE LOWER(status) = 'missing'`
    );

    res.json({
      success: true,
      data: {
        petsAdopted: parseInt(adoptedPets.rows[0].count),
        petsReunited: parseInt(reunitedPets.rows[0].count),
        dogs: parseInt(dogsCount.rows[0].count),
        cats: parseInt(catsCount.rows[0].count),
        availablePets: parseInt(availablePets.rows[0].count),
        missingPets: parseInt(missingPets.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Error fetching home stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};