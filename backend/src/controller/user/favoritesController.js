
import pool from '../../database/index.js';

/* ======================================
   ADD TO FAVORITES
====================================== */
export const addFavorite = async (req, res) => {
    try {
        const { pet_id } = req.body;
        const userId = req.user.userId;

        // Check if already exists
        const existing = await pool.query(
            'SELECT * FROM favorites WHERE user_id = $1 AND pet_id = $2',
            [userId, pet_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Pet already in favorites'
            });
        }

        await pool.query(
            'INSERT INTO favorites (user_id, pet_id) VALUES ($1, $2)',
            [userId, pet_id]
        );

        res.status(201).json({
            success: true,
            message: 'Added to favorites'
        });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/* ======================================
   REMOVE FROM FAVORITES
====================================== */
export const removeFavorite = async (req, res) => {
    try {
        const { petId } = req.params;
        const userId = req.user.userId;

        await pool.query(
            'DELETE FROM favorites WHERE user_id = $1 AND pet_id = $2',
            [userId, petId]
        );

        res.status(200).json({
            success: true,
            message: 'Removed from favorites'
        });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/* ======================================
   GET USER FAVORITES
====================================== */
export const getUserFavorites = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT p.*, f.created_at as favorited_at
       FROM favorites f
       JOIN pets p ON f.pet_id = p.pet_id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
            [userId]
        );

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
