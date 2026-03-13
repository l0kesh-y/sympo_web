const axios = require('axios');
const { Pool } = require('pg');
require('dotenv').config();

// We need to install axios first
console.log('Please run: npm install axios');
console.log('Then run this script again.');

// Alternative approach using built-in fetch
async function debugFullFlow() {
    try {
        console.log('🔍 Debugging full authentication and question flow...\n');
        
        // First, let's check what teams exist and their session state
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
        
        const teams = await pool.query(`SELECT id, team_name, coins FROM teams WHERE team_name != 'admin'`);
        console.log('Available teams:');
        teams.rows.forEach(team => {
            console.log(`- ${team.team_name} (ID: ${team.id}, Coins: ${team.coins})`);
        });
        
        // Check purchased questions
        const purchased = await pool.query(`
            SELECT t.team_name, q.title, tq.bid_amount, tq.assigned_time
            FROM team_questions tq
            JOIN teams t ON tq.team_id = t.id
            JOIN questions q ON tq.question_id = q.id
            ORDER BY tq.assigned_time DESC
        `);
        
        console.log('\nPurchased questions:');
        if (purchased.rows.length === 0) {
            console.log('No purchased questions found!');
        } else {
            purchased.rows.forEach(row => {
                console.log(`- ${row.team_name} bought "${row.title}" for ${row.bid_amount} B2C`);
            });
        }
        
        await pool.end();
        
        console.log('\n💡 To test the API endpoint:');
        console.log('1. Log in as a team through the web interface');
        console.log('2. Open browser developer tools (F12)');
        console.log('3. Go to Network tab');
        console.log('4. Navigate to "My Questions" page');
        console.log('5. Look for the /api/bid/my-questions request');
        console.log('6. Check the response status and data');
        
    } catch (error) {
        console.error('Debug error:', error);
    }
}

debugFullFlow();