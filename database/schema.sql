-- Bid2Code Database Schema
-- PostgreSQL 17

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    coins INTEGER DEFAULT 500,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    round INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    bid_amount INTEGER NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team questions (purchased questions)
CREATE TABLE IF NOT EXISTS team_questions (
    id SERIAL PRIMARY KEY,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    bid_amount INTEGER NOT NULL,
    assigned_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bids_team_id ON bids(team_id);
CREATE INDEX IF NOT EXISTS idx_bids_question_id ON bids(question_id);
CREATE INDEX IF NOT EXISTS idx_team_questions_team_id ON team_questions(team_id);
CREATE INDEX IF NOT EXISTS idx_team_questions_question_id ON team_questions(question_id);

-- Insert sample admin user (password: admin123)
INSERT INTO teams (team_name, password, coins) VALUES 
('admin', '$2a$10$rVv8T3HJ9.9DzW3N8.QyUuF5Q1xG8Z6Y2m7P9R4S6T8U0V2W4X6Y8Z0', 999999)
ON CONFLICT (team_name) DO NOTHING;