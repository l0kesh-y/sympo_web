const { Pool } = require('pg');
require('dotenv').config();

// Database connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Database connected successfully');
    }
});

// Database query functions
const db = {
    // Team operations
    async createTeam(teamName, password) {
        const query = 'INSERT INTO teams (team_name, password) VALUES ($1, $2) RETURNING id, team_name, coins';
        const values = [teamName, password];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async getTeamByName(teamName) {
        const query = 'SELECT * FROM teams WHERE team_name = $1';
        const result = await pool.query(query, [teamName]);
        return result.rows[0];
    },

    async getTeamById(teamId) {
        const query = 'SELECT id, team_name, coins FROM teams WHERE id = $1';
        const result = await pool.query(query, [teamId]);
        return result.rows[0];
    },

    async updateTeamCoins(teamId, coins) {
        const query = 'UPDATE teams SET coins = $1 WHERE id = $2 RETURNING coins';
        const result = await pool.query(query, [coins, teamId]);
        return result.rows[0];
    },

    // Question operations
    async createQuestion(title, description, difficulty, round) {
        const query = 'INSERT INTO questions (title, description, difficulty, round) VALUES ($1, $2, $3, $4) RETURNING *';
        const values = [title, description, difficulty, round];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async getAllQuestions() {
        const query = 'SELECT * FROM questions ORDER BY round, created_at';
        const result = await pool.query(query);
        return result.rows;
    },

    async getQuestionsByRound(round) {
        const query = 'SELECT * FROM questions WHERE round = $1 ORDER BY created_at';
        const result = await pool.query(query, [round]);
        return result.rows;
    },

    // Bid operations
    async createBid(teamId, questionId, bidAmount) {
        const query = 'INSERT INTO bids (team_id, question_id, bid_amount) VALUES ($1, $2, $3) RETURNING *';
        const values = [teamId, questionId, bidAmount];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async getBidsForQuestion(questionId) {
        const query = `
            SELECT b.*, t.team_name 
            FROM bids b 
            JOIN teams t ON b.team_id = t.id 
            WHERE b.question_id = $1 
            ORDER BY b.bid_amount DESC, b.timestamp ASC
        `;
        const result = await pool.query(query, [questionId]);
        return result.rows;
    },

    async getHighestBidForQuestion(questionId) {
        const query = `
            SELECT b.*, t.team_name 
            FROM bids b 
            JOIN teams t ON b.team_id = t.id 
            WHERE b.question_id = $1 
            ORDER BY b.bid_amount DESC, b.timestamp ASC 
            LIMIT 1
        `;
        const result = await pool.query(query, [questionId]);
        return result.rows[0];
    },

    // Team questions (purchased)
    async assignQuestionToTeam(teamId, questionId, bidAmount) {
        const query = 'INSERT INTO team_questions (team_id, question_id, bid_amount) VALUES ($1, $2, $3) RETURNING *';
        const values = [teamId, questionId, bidAmount];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async getTeamQuestions(teamId) {
        const query = `
            SELECT tq.*, q.title, q.description, q.difficulty, q.round
            FROM team_questions tq
            JOIN questions q ON tq.question_id = q.id
            WHERE tq.team_id = $1
            ORDER BY tq.assigned_time DESC
        `;
        const result = await pool.query(query, [teamId]);
        return result.rows;
    },

    // Get all teams for admin view
    async getAllTeams() {
        const query = 'SELECT id, team_name, coins, created_at FROM teams ORDER BY team_name';
        const result = await pool.query(query);
        return result.rows;
    }
};

module.exports = db;