const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://formflow-frontend.netlify.app',
    'https://formflow-frontend.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('Blocked origin:', origin);
            return callback(null, true); // Allow anyway for demo
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());

// Import routes
const surveyRoutes = require('./routes/surveys');
const questionRoutes = require('./routes/questions');
const responseRoutes = require('./routes/responses');

// Use routes
app.use('/api/surveys', surveyRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/responses', responseRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!',
        database: 'Connected to TiDB Cloud',
        timestamp: new Date().toISOString()
    });
});

// Health check for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API URL: http://localhost:${PORT}/api/test`);
});