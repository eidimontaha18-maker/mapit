-- Create house table with only an id column
CREATE TABLE IF NOT EXISTS house (
    id SERIAL PRIMARY KEY
);

-- Add comment for documentation
COMMENT ON TABLE house IS 'Stores house information with only an ID column';