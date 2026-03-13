const express = require('express');
const db = require('../db');
const { requireTeamAuth } = require('./auth');
const router = express.Router();

// Place a bid
router.post('/place-bid', requireTeamAuth, async (req, res) => {
    try {
        const { questionId, bidAmount } = req.body;
        const teamId = req.session.teamId;

        // Validation
        if (!questionId || bidAmount === undefined) {
            return res.status(400).json({ error: 'Question ID and bid amount are required' });
        }

        const bidValue = parseInt(bidAmount);
        if (isNaN(bidValue) || bidValue <= 0) {
            return res.status(400).json({ error: 'Bid amount must be a positive number' });
        }

        // Get team info
        const team = await db.getTeamById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if team has enough coins
        if (team.coins < bidValue) {
            return res.status(400).json({ error: 'Insufficient coins' });
        }

        // Get current highest bid for this question
        const highestBid = await db.getHighestBidForQuestion(questionId);
        const currentHighest = highestBid ? highestBid.bid_amount : 0;

        // Check if bid is higher than current highest
        if (bidValue <= currentHighest) {
            return res.status(400).json({ 
                error: 'Bid must be higher than current highest bid',
                currentHighest: currentHighest
            });
        }

        // Create bid
        const bid = await db.createBid(teamId, questionId, bidValue);

        res.json({
            message: 'Bid placed successfully',
            bid: {
                id: bid.id,
                teamId: bid.team_id,
                questionId: bid.question_id,
                bidAmount: bid.bid_amount,
                timestamp: bid.timestamp
            }
        });

    } catch (error) {
        console.error('Place bid error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get team's purchased questions
router.get('/my-questions', requireTeamAuth, async (req, res) => {
    try {
        const teamId = req.session.teamId;
        const questions = await db.getTeamQuestions(teamId);
        res.json(questions);
    } catch (error) {
        console.error('Get team questions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get team's current coins
router.get('/my-coins', requireTeamAuth, async (req, res) => {
    try {
        const teamId = req.session.teamId;
        const team = await db.getTeamById(teamId);
        
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        res.json({ coins: team.coins });
    } catch (error) {
        console.error('Get coins error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get bids for a specific question (for team view)
router.get('/question/:questionId/bids', requireTeamAuth, async (req, res) => {
    try {
        const questionId = parseInt(req.params.questionId);
        const bids = await db.getBidsForQuestion(questionId);
        
        // Return only necessary information for team view
        const simplifiedBids = bids.map(bid => ({
            teamName: bid.team_name,
            bidAmount: bid.bid_amount,
            timestamp: bid.timestamp
        }));

        res.json(simplifiedBids);
    } catch (error) {
        console.error('Get question bids error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get highest bid for a question (for team view)
router.get('/question/:questionId/highest', requireTeamAuth, async (req, res) => {
    try {
        const questionId = parseInt(req.params.questionId);
        const highestBid = await db.getHighestBidForQuestion(questionId);
        
        if (highestBid) {
            res.json({
                teamName: highestBid.team_name,
                bidAmount: highestBid.bid_amount
            });
        } else {
            res.json({ bidAmount: 0 });
        }
    } catch (error) {
        console.error('Get highest bid error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;