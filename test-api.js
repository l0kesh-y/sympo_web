const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function testApiEndpoint() {
    try {
        console.log('🧪 Testing API endpoint behavior...\n');
        
        // Get the shark team ID
        const sharkTeam = await pool.query(`SELECT id FROM teams WHERE team_name = 'shark'`);
        const sharkTeamId = sharkTeam.rows[0].id;
        console.log(`Shark team ID: ${sharkTeamId}`);
        
        // Test the exact query used in getTeamQuestions
        const query = `
            SELECT tq.*, q.title, q.description, q.difficulty, q.round
            FROM team_questions tq
            JOIN questions q ON tq.question_id = q.id
            WHERE tq.team_id = $1
            ORDER BY tq.assigned_time DESC
        `;
        
        const result = await pool.query(query, [sharkTeamId]);
        console.log(`\nQuery returned ${result.rows.length} rows:`);
        console.log(JSON.stringify(result.rows, null, 2));
        
        await pool.end();
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testApiEndpoint();