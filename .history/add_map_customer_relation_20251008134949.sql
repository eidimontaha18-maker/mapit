-- Add customer_id column to map table
ALTER TABLE map 
ADD COLUMN customer_id INTEGER;

-- Add foreign key constraint
ALTER TABLE map
ADD CONSTRAINT fk_map_customer
FOREIGN KEY (customer_id) 
REFERENCES customer(customer_id)
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_map_customer_id ON map(customer_id);

-- Add comment to document relationship
COMMENT ON COLUMN map.customer_id IS 'Foreign key to customer who created this map';