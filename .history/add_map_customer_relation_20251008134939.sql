-- Add customer_id column to map table
ALTER TABLE map 
ADD COLUMN IF NOT EXISTS customer_id INTEGER;

-- Add foreign key constraint
ALTER TABLE map
ADD CONSTRAINT fk_map_customer
FOREIGN KEY (customer_id) 
REFERENCES customer(customer_id)
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_map_customer_id ON map(customer_id);

-- Add default constraint that non-null customer_id must exist in customer table
ALTER TABLE map
ADD CONSTRAINT check_customer_exists
CHECK (customer_id IS NULL OR 
       EXISTS (SELECT 1 FROM customer WHERE customer.customer_id = map.customer_id));

-- Add comment to document relationship
COMMENT ON COLUMN map.customer_id IS 'Foreign key to customer who created this map';