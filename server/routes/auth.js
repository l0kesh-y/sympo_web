const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

// Team signup (requires admin password)
router.post('/signup', async (req, res) => {
    try {
        const { teamName, password, adminPassword } = req.body;

        // Validation
        if (!teamName || !password || !adminPassword) {
            return res.status(400).json({ error: 'Team name, password, and admin password are required' });
        }

        // Verify admin password first
        const correctAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        if (adminPassword !== correctAdminPassword) {
            return res.status(401).json({ error: 'Invalid admin password. Contact the organizer for the correct password.' });
        }

        if (teamName.length < 3 || teamName.length > 50) {
            return res.status(400).json({ error: 'Team name must be between 3 and 50 characters' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if team already exists
        const existingTeam = await db.getTeamByName(teamName);
        if (existingTeam) {
            return res.status(400).json({ error: 'Team name already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create team
        const team = await db.createTeam(teamName, hashedPassword);

        // Store team in session
        req.session.teamId = team.id;
        req.session.teamName = team.team_name;

        res.status(201).json({
            message: 'Team registered successfully',
            team: {
                id: team.id,
                teamName: team.team_name,
                coins: team.coins
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Team login
router.post('/login', async (req, res) => {
    try {
        const { teamName, password } = req.body;

        // Validation
        if (!teamName || !password) {
            return res.status(400).json({ error: 'Team name and password are required' });
        }

        // Get team
        const team = await db.getTeamByName(teamName);
        if (!team) {
            return res.status(401).json({ error: 'Invalid team name or password' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, team.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid team name or password' });
        }

        // Store team in session
        req.session.teamId = team.id;
        req.session.teamName = team.team_name;

        res.json({
            message: 'Login successful',
            team: {
                id: team.id,
                teamName: team.team_name,
                coins: team.coins
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin login (from environment variables)
router.post('/admin/login', (req, res) => {
    try {
        const { username, password } = req.body;

        console.log('Admin login attempt:', { username, sessionBefore: req.session });

        // Get admin credentials from environment variables
        const adminUsername = process.env.ADMIN_USERNAME || 'admin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        const adminName = process.env.ADMIN_NAME || 'Administrator';

        // Check credentials
        if (username === adminUsername && password === adminPassword) {
            req.session.isAdmin = true;
            req.session.adminName = adminName;
            
            console.log('Admin login successful, session:', req.session);
            
            res.json({
                message: 'Admin login successful',
                admin: {
                    name: adminName
                }
            });
        } else {
            console.log('Admin login failed: invalid credentials');
            res.status(401).json({ error: 'Invalid admin credentials' });
        }

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not log out' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
    });
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        console.log('Checking auth status, session:', req.session);
        
        if (req.session.teamId) {
            // Team user
            console.log('Team user found:', req.session.teamId);
            const team = await db.getTeamById(req.session.teamId);
            if (team) {
                res.json({
                    userType: 'team',
                    team: {
                        id: team.id,
                        teamName: team.team_name,
                        coins: team.coins
                    }
                });
            } else {
                res.status(404).json({ error: 'Team not found' });
            }
        } else if (req.session.isAdmin) {
            // Admin user
            console.log('Admin user found');
            res.json({
                userType: 'admin',
                admin: {
                    name: req.session.adminName
                }
            });
        } else {
            console.log('No authenticated user found');
            res.status(401).json({ error: 'Not authenticated' });
        }
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to check if team is authenticated
const requireTeamAuth = (req, res, next) => {
    if (!req.session.teamId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
};

// Middleware to check if admin is authenticated
const requireAdminAuth = (req, res, next) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Admin authentication required' });
    }
    next();
};

module.exports = {
    router,
    requireTeamAuth,
    requireAdminAuth
};