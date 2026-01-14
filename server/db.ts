import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL CHECK (role IN ('RECICLADOR','COLETOR')),
      google_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS collection_points (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      address TEXT,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      types TEXT,
      hours TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings();
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id INT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS point_id INT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS collector_id INT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE;
    
    ALTER TABLE collection_points ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS collector_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS waste_type TEXT NOT NULL DEFAULT 'Não Informado';
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS weight DOUBLE PRECISION NOT NULL DEFAULT 0.1;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recycler_address TEXT;
    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS collected_weight DOUBLE PRECISION;

    ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status VARCHAR(255);

    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
    ALTER TABLE bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('PENDING','CONFIRMED','COMPLETED','CANCELLED','PAUSED'));
  `);
}
