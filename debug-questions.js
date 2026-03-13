const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function debugQuestions() {
    try {
        console.log('🔍 Debugging purchased questions...\n');
        
        // Check all tables
        const tables = ['teams', 'questions', 'bids', 'team_questions'];
        
        for (const table of tables) {
            const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`${table}: ${result.rows[0].count} records`);
        }
        
        console.log('\n--- TEAM QUESTIONS TABLE ---');
        const teamQuestions = await pool.query(`
            SELECT tq.*, t.team_name, q.title 
            FROM team_questions tq
            JOIN teams t ON tq.team_id = t.id
            JOIN questions q ON tq.question_id = q.id
            ORDER BY tq.assigned_time DESC
        `);
        
        if (teamQuestions.rows.length === 0) {
            console.log('No purchased questions found!');
        } else {
            console.log(`Found ${teamQuestions.rows.length} purchased questions:`);
            teamQuestions.rows.forEach((row, index) => {
                console.log(`${index + 1}. Team "${row.team_name}" bought "${row.title}" for ${row.bid_amount} B2C`);
            });
        }
        
        console.log('\n--- RECENT BIDS ---');
        const recentBids = await pool.query(`
            SELECT b.*, t.team_name, q.title
            FROM bids b
            JOIN teams t ON b.team_id = t.id
            JOIN questions q ON b.question_id = q.id
            ORDER BY b.timestamp DESC
            LIMIT 10
        `);
        
        if (recentBids.rows.length === 0) {
            console.log('No bids found!');
        } else {
            console.log(`Found ${recentBids.rows.length} recent bids:`);
            recentBids.rows.forEach((row, index) => {
                console.log(`${index + 1}. ${row.team_name} bid ${row.bid_amount} on "${row.title}"`);
            });
        }
        
        console.log('\n--- TEAMS WITH COINS ---');
        const teams = await pool.query(`
            SELECT id, team_name, coins 
            FROM teams 
            WHERE team_name != 'admin'
            ORDER BY team_name
        `);
        
        teams.rows.forEach(team => {
            console.log(`Team "${team.team_name}": ${team.coins} coins`);
        });
        
        await pool.end();
        
    } catch (error) {
        console.error('Debug error:', error);
    }
}

debugQuestions();