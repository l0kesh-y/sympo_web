const express = require('express');
const db = require('../db');
const { requireAdminAuth } = require('./auth');
const router = express.Router();

// Create question
router.post('/questions', requireAdminAuth, async (req, res) => {
    try {
        const { title, description, difficulty, round } = req.body;

        // Validation
        if (!title || !description || !difficulty || round === undefined) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (title.length > 200) {
            return res.status(400).json({ error: 'Title must be less than 200 characters' });
        }

        const validDifficulties = ['Easy', 'Medium', 'Hard'];
        if (!validDifficulties.includes(difficulty)) {
            return res.status(400).json({ error: 'Invalid difficulty level' });
        }

        if (round < 1 || round > 10) {
            return res.status(400).json({ error: 'Round must be between 1 and 10' });
        }

        // Create question
        const question = await db.createQuestion(title, description, difficulty, round);

        res.status(201).json({
            message: 'Question created successfully',
            question
        });

    } catch (error) {
        console.error('Create question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all questions
router.get('/questions', requireAdminAuth, async (req, res) => {
    try {
        const questions = await db.getAllQuestions();
        res.json(questions);
    } catch (error) {
        console.error('Get questions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get questions by round
router.get('/questions/round/:round', requireAdminAuth, async (req, res) => {
    try {
        const round = parseInt(req.params.round);
        const questions = await db.getQuestionsByRound(round);
        res.json(questions);
    } catch (error) {
        console.error('Get questions by round error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all teams
router.get('/teams', requireAdminAuth, async (req, res) => {
    try {
        const teams = await db.getAllTeams();
        res.json(teams);
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get bids for a specific question
router.get('/bids/question/:questionId', requireAdminAuth, async (req, res) => {
    try {
        const questionId = parseInt(req.params.questionId);
        const bids = await db.getBidsForQuestion(questionId);
        res.json(bids);
    } catch (error) {
        console.error('Get bids error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get highest bid for a question
router.get('/bids/question/:questionId/highest', requireAdminAuth, async (req, res) => {
    try {
        const questionId = parseInt(req.params.questionId);
        const highestBid = await db.getHighestBidForQuestion(questionId);
        res.json(highestBid || { bid_amount: 0 });
    } catch (error) {
        console.error('Get highest bid error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset team coins (for testing)
router.post('/teams/:teamId/reset-coins', requireAdminAuth, async (req, res) => {
    try {
        const teamId = parseInt(req.params.teamId);
        const { coins } = req.body;

        if (coins === undefined || coins < 0) {
            return res.status(400).json({ error: 'Valid coin amount required' });
        }

        const updatedTeam = await db.updateTeamCoins(teamId, coins);
        
        if (!updatedTeam) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json({
            message: 'Team coins updated successfully',
            team: updatedTeam
        });

    } catch (error) {
        console.error('Reset coins error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get statistics
router.get('/stats', requireAdminAuth, async (req, res) => {
    try {
        const teams = await db.getAllTeams();
        const questions = await db.getAllQuestions();
        
        const stats = {
            totalTeams: teams.length,
            totalQuestions: questions.length,
            teamsWithQuestions: 0,
            averageCoins: Math.round(teams.reduce((sum, team) => sum + team.coins, 0) / teams.length) || 0
        };

        // Count teams that have purchased questions
        for (const team of teams) {
            const teamQuestions = await db.getTeamQuestions(team.id);
            if (teamQuestions.length > 0) {
                stats.teamsWithQuestions++;
            }
        }

        res.json(stats);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;