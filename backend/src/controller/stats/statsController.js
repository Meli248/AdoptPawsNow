import pool from '../../database/index.js';

/* ======================================
   GET HOME PAGE STATISTICS
====================================== */
export const getHomeStats = async (req, res) => {
  try {
    // Count adopted pets (status = 'adopted')
    const adoptedPets = await pool.query(
      `SELECT COUNT(*) FROM pets WHERE LOWER(status) = 'adopted'`
    );

    // Count dogs
    const dogsCount = await pool.query(
      `SELECT COUNT(*) FROM pets WHERE LOWER(species) = 'dog'`
    );

    // Count cats
    const catsCount = await pool.query(
      `SELECT COUNT(*) FROM pets WHERE LOWER(species) = 'cat'`
    );

    res.json({
      success: true,
      data: {
        petsAdopted: parseInt(adoptedPets.rows[0].count),
        dogs: parseInt(dogsCount.rows[0].count),
        cats: parseInt(catsCount.rows[0].count)
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