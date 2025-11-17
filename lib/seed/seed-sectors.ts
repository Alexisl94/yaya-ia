/**
 * Seed function for sectors table
 * Usage: npm run seed:sectors
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { SECTORS } from './sectors'

/**
 * Seeds the sectors table with pre-configured business sectors
 * Uses upsert to avoid duplicates based on slug
 *
 * @returns {Promise<void>}
 */
async function seedSectors() {
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[ERROR] Missing Supabase environment variables!')
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🌱 Starting sectors seed...\n')

  try {
    // Upsert all sectors (update if exists, insert if not)
    const { data, error } = await supabase
      .from('sectors')
      .upsert(
        SECTORS.map(sector => ({
          ...sector,
          // Remove id to let Supabase generate it
          // Upsert will match on slug (which is unique)
        })),
        {
          onConflict: 'slug',
          ignoreDuplicates: false
        }
      )
      .select()

    if (error) {
      console.error('[ERROR] Error seeding sectors:', error.message)
      console.error('Details:', error)
      process.exit(1)
    }

    const count = data ? data.length : SECTORS.length
    console.log(`✅ Successfully seeded ${count} sectors:\n`)

    // Display seeded sectors
    SECTORS.forEach((sector, index) => {
      console.log(`  ${index + 1}. ${sector.icon} ${sector.name} (${sector.slug})`)
    })

    console.log('\n🎉 Seed completed successfully!')

  } catch (err) {
    console.error('[ERROR] Unexpected error:', err)
    process.exit(1)
  }
}

// Run the seed function
seedSectors()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('[ERROR] Fatal error:', err)
    process.exit(1)
  })
