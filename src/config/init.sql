CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'COUPON', -- can add more product types later
    image_url TEXT NOT NULL,

    -- pricing fields
    cost_price DECIMAL(10, 2) NOT NULL CHECK (cost_price >= 0),
    margin_percentage DECIMAL(10, 2) NOT NULL CHECK (margin_percentage >= 0),
    minimum_sell_price DECIMAL(10, 2) NOT NULL,
    is_sold BOOLEAN DEFAULT false,

    -- the actual coupon code/value that buyers get after purchase
    value_type VARCHAR(20) NOT NULL DEFAULT 'STRING',
    value TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- speeds up queries for available (unsold) products
CREATE INDEX IF NOT EXISTS idx_products_unsold ON products (is_sold) WHERE is_sold = false;
