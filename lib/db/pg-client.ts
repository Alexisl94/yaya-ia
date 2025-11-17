/**
 * Direct PostgreSQL connection bypassing Supabase PostgREST
 * This is used to work around PostgREST schema cache issues
 */

import { Pool } from 'pg'

let pool: Pool | null = null

/**
 * Get or create a PostgreSQL connection pool
 * This connects directly to PostgreSQL, bypassing PostgREST entirely
 */
export function getPostgresPool(): Pool {
  if (pool) {
    return pool
  }

  // Construct direct PostgreSQL connection string from Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

  if (!projectRef) {
    throw new Error('Invalid Supabase URL format')
  }

  // For Supabase hosted projects, we need the database password
  // This should be added to .env.local as SUPABASE_DB_PASSWORD
  const dbPassword = process.env.SUPABASE_DB_PASSWORD

  if (!dbPassword) {
    throw new Error(
      'SUPABASE_DB_PASSWORD not found in environment variables. ' +
      'Get it from Supabase Dashboard → Settings → Database → Connection String (Direct connection)'
    )
  }

  // Direct PostgreSQL connection (port 5432, not PostgREST port 443)
  const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`

  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false, // Supabase uses self-signed certs
    },
    max: 10, // Maximum number of connections in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })

  // Log connection errors
  pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err)
  })

  console.log('[SUCCESS] Direct PostgreSQL pool created, bypassing PostgREST')

  return pool
}

/**
 * Close the PostgreSQL connection pool
 */
export async function closePostgresPool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
