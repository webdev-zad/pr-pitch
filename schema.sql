-- Database schema for PR Pitch Management System
-- This would be used with your Postgres database

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pr_pitches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  pitch_id INTEGER REFERENCES pr_pitches(id),
  recipient_email VARCHAR(255),
  subject VARCHAR(255),
  body TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  gmail_message_id VARCHAR(255)
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_pr_pitches_user_id ON pr_pitches(user_id);
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
