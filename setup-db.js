const { Pool } = require('pg');
require('dotenv').config();

// Read the schema file
const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'database', 'schema.sql');
const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

// Create database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function setupDatabase() {
    try {
        console.log('Connecting to database...');
        
        // Test connection
        const client = await pool.connect();
        console.log('Database connected successfully!');
        
        // Run the schema
        console.log('Creating tables...');
        await client.query(schemaSQL);
        console.log('Tables created successfully!');
        
        // Verify tables exist
        const result = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('teams', 'questions', 'bids', 'team_questions')
            ORDER BY table_name;
        `);
        
        console.log('Created tables:');
        result.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });
        
        client.release();
        await pool.end();
        
        console.log('\n✅ Database setup completed successfully!');
        console.log('You can now start the application with: npm start');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

setupDatabase();