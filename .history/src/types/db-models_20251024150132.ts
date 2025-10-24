// Database model interfaces for the MapIt application

/**
 * Customer model interface
 */
export interface Customer {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  registration_date: Date;
}

/**
 * Map model interface
 */
export interface Map {
  map_id: number;
  title: string;
  description: string | null;
  created_at: Date;
  map_data: Record<string, unknown> | null; // Using JSONB in PostgreSQL
  map_bounds: Record<string, unknown> | null; // Using JSONB in PostgreSQL
  active: boolean;
  country: string | null;
  map_code: string | null;
}

/**
 * Customer creation data (without auto-generated fields)
 */
export type CustomerCreationData = Omit<Customer, 'customer_id' | 'registration_date'>;

/**
 * Map creation data (without auto-generated fields)
 */
export type MapCreationData = Omit<Map, 'map_id' | 'created_at'>;
