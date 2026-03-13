const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const { router: authRouter } = require('./routes/auth');
const adminRouter = require('./routes/admin');
const bidRouter = require('./routes/bid');
const { initializeSocket } = require('./socket');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow localhost variations for development
        if (origin.indexOf('localhost') !== -1 || origin.indexOf('127.0.0.1') !== -1) {
            return callback(null, true);
        }
        
        // Allow Render domains in production
        if (origin.indexOf('onrender.com') !== -1) {
            return callback(null, true);
        }
        
        // Allow custom domains (add your domain here if using custom domain)
        // if (origin === 'https://yourdomain.com') {
        //     return callback(null, true);
        // }
        
        // Block other origins
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Session configuration - MUST be before routes
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'bid2code-secret-key',
    resave: false,
    saveUninitialized: false,
    name: 'b2c.sid', // Custom session cookie name
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
    }
});

// Apply session middleware
app.use(sessionMiddleware);

// Initialize Socket.io
initializeSocket(io);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/bid', bidRouter);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/team/login.html'));
});

app.get('/team/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/team/signup.html'));
});

app.get('/team/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/team/login.html'));
});

app.get('/team/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/team/dashboard.html'));
});

app.get('/team/questions', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/team/bought_questions.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});

app.get('/admin/create-question', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/create_question.html'));
});

app.get('/admin/live-bidding', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/live_bidding.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint to check session
app.get('/debug/session', (req, res) => {
    res.json({
        session: req.session,
        sessionId: req.sessionID,
        isAdmin: req.session.isAdmin,
        teamId: req.session.teamId
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Bid2Code server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});