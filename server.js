const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
    origin: true, // Allow all origins for testing
    credentials: true
}));

app.use(express.json());

// Import routes
const surveyRoutes = require('./routes/surveys');
const questionRoutes = require('./routes/questions');
const responseRoutes = require('./routes/responses');

// Debug middleware - log all requests
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    next();
});

// Root API endpoint (fixes the 404)
app.get('/api', (req, res) => {
    res.json({
        message: 'FormFlow API is running!',
        version: '1.0.0',
        endpoints: {
            surveys: '/api/surveys',
            questions: '/api/questions',
            responses: '/api/responses',
            analytics: '/api/responses/analytics/:surveyId',
            test: '/api/test'
        }
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!',
        database: 'Connected to TiDB Cloud',
        timestamp: new Date().toISOString(),
        endpoints: '/api/surveys, /api/questions, /api/responses'
    });
});

// Use routes
app.use('/api/surveys', surveyRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/responses', responseRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        requestedUrl: req.originalUrl,
        availableEndpoints: [
            'GET /api',
            'GET /api/test',
            'GET /api/surveys',
            'POST /api/surveys',
            'GET /api/surveys/:id',
            'PATCH /api/surveys/:id',
            'DELETE /api/surveys/:id',
            'POST /api/questions',
            'DELETE /api/questions/:id',
            'POST /api/responses',
            'GET /api/responses/survey/:surveyId',
            'GET /api/responses/analytics/:surveyId',
            'DELETE /api/responses/:responseId'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}/api`);
});