-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prizes table
CREATE TABLE prizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  text_color TEXT NOT NULL,
  probability FLOAT NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_prizes table to track prize history
CREATE TABLE user_prizes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  prize_id UUID NOT NULL REFERENCES prizes(id),
  prize_name TEXT NOT NULL,
  code TEXT NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial prizes
INSERT INTO prizes (name, color, text_color, probability) VALUES
('50% OFF', '#FF5733', '#FFFFFF', 0.5),
('Free Shipping', '#33FF57', '#000000', 1.0),
('Buy 1 Get 1', '#3357FF', '#FFFFFF', 0.3),
('10% OFF', '#F3FF33', '#000000', 2.0),
('25% OFF', '#FF33F3', '#FFFFFF', 0.8),
('Free Gift', '#33FFF3', '#000000', 0.7),
('75% OFF', '#FF8333', '#FFFFFF', 0.2),
('Try Again', '#8333FF', '#FFFFFF', 3.0);

-- Create indexes for better performance
CREATE INDEX idx_user_prizes_user_id ON user_prizes(user_id);
CREATE INDEX idx_user_prizes_created_at ON user_prizes(created_at);
