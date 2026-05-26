const express = require('express');
const db = require('../db');
const router = express.Router();

// Helper function to format options for storage
const formatOptionsForStorage = (options) => {
    if (!options) return null;
    if (typeof options === 'string') {
        // If it's already a JSON string, return as is
        if (options.startsWith('[') || options.startsWith('{')) {
            return options;
        }
        // If it's comma-separated, convert to JSON array
        if (options.includes(',')) {
            const arr = options.split(',').map(s => s.trim());
            return JSON.stringify(arr);
        }
        // Single value
        return JSON.stringify([options]);
    }
    if (Array.isArray(options)) {
        return JSON.stringify(options);
    }
    return null;
};

// Add question to survey
router.post('/', async (req, res) => {
    const { survey_id, question_text, question_type, options_json } = req.body;
    
    // Format options properly for MCQ
    let formattedOptions = null;
    if (question_type === 'mcq' && options_json) {
        formattedOptions = formatOptionsForStorage(options_json);
    }
    
    try {
        const [result] = await db.query(
            'INSERT INTO questions (survey_id, question_text, question_type, options_json) VALUES (?, ?, ?, ?)',
            [survey_id, question_text, question_type, formattedOptions]
        );
        
        const [newQuestion] = await db.query('SELECT * FROM questions WHERE id = ?', [result.insertId]);
        res.status(201).json(newQuestion[0]);
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get questions for a survey
router.get('/survey/:surveyId', async (req, res) => {
    try {
        const [questions] = await db.query(
            'SELECT * FROM questions WHERE survey_id = ?',
            [req.params.surveyId]
        );
        res.json(questions);
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