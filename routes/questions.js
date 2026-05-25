const express = require('express');
const db = require('../db');
const router = express.Router();

// Add question to survey
router.post('/', async (req, res) => {
    const { survey_id, question_text, question_type, options_json } = req.body;
    
    try {
        const [result] = await db.query(
            'INSERT INTO questions (survey_id, question_text, question_type, options_json) VALUES (?, ?, ?, ?)',
            [survey_id, question_text, question_type, options_json || null]
        );
        
        const [newQuestion] = await db.query('SELECT * FROM questions WHERE id = ?', [result.insertId]);
        res.status(201).json(newQuestion[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete question
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;