const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all surveys
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM surveys ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single survey with its questions
router.get('/:id', async (req, res) => {
    try {
        const [survey] = await db.query('SELECT * FROM surveys WHERE id = ?', [req.params.id]);
        const [questions] = await db.query('SELECT * FROM questions WHERE survey_id = ?', [req.params.id]);
        
        if (survey.length === 0) {
            return res.status(404).json({ error: 'Survey not found' });
        }
        
        res.json({
            ...survey[0],
            questions: questions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new survey
router.post('/', async (req, res) => {
    const { title, description } = req.body;
    
    try {
        const [result] = await db.query(
            'INSERT INTO surveys (title, description) VALUES (?, ?)',
            [title, description]
        );
        
        const [newSurvey] = await db.query('SELECT * FROM surveys WHERE id = ?', [result.insertId]);
        res.status(201).json(newSurvey[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update survey (close survey)
router.patch('/:id', async (req, res) => {
    const { is_active } = req.body;
    
    try {
        await db.query('UPDATE surveys SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
        res.json({ message: 'Survey updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete survey
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM surveys WHERE id = ?', [req.params.id]);
        res.json({ message: 'Survey deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;