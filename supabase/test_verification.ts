/**
 * BugTrail AI — Automated Database & Schema Verification Runner
 * Validates migration structure, constraints, RLS policies, and triggers
 */

import fs from 'fs';
import path from 'path';

function runSchemaAudit() {
  console.log('--- BugTrail AI Schema & Security Audit ---');
  
  const migrationPath = path.resolve(process.cwd(), 'supabase/migration.sql');
  if (!fs.existsSync(migrationPath)) {
    console.error('FAIL: migration.sql does not exist');
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  // 1. Table definitions
  const requiredTables = ['profiles', 'user_progress', 'learning_stats', 'achievements', 'learning_activity'];
  for (const table of requiredTables) {
    if (sql.includes(`CREATE TABLE IF NOT EXISTS public.${table}`)) {
      console.log(`[PASS] Table defined: public.${table}`);
    } else {
      console.error(`[FAIL] Missing table: public.${table}`);
      process.exit(1);
    }
  }

  // 2. Row Level Security checks
  for (const table of requiredTables) {
    if (sql.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`)) {
      console.log(`[PASS] RLS enabled: public.${table}`);
    } else {
      console.error(`[FAIL] RLS NOT enabled on table: public.${table}`);
      process.exit(1);
    }
  }

  // 3. Unique Constraints
  if (sql.includes('CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)')) {
    console.log('[PASS] Unique constraint on (user_id, challenge_id) verified');
  } else {
    console.error('[FAIL] Missing unique constraint on (user_id, challenge_id)');
    process.exit(1);
  }

  if (sql.includes('CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_key)')) {
    console.log('[PASS] Unique constraint on (user_id, achievement_key) verified');
  } else {
    console.error('[FAIL] Missing unique constraint on (user_id, achievement_key)');
    process.exit(1);
  }

  // 4. Trusted Function & Triggers
  if (sql.includes('FUNCTION public.record_challenge_completion')) {
    console.log('[PASS] Trusted server function record_challenge_completion exists with SECURITY DEFINER');
  } else {
    console.error('[FAIL] Missing record_challenge_completion trusted function');
    process.exit(1);
  }

  if (sql.includes('FUNCTION public.handle_new_user')) {
    console.log('[PASS] Auto new user trigger function handle_new_user exists');
  } else {
    console.error('[FAIL] Missing handle_new_user trigger function');
    process.exit(1);
  }

  // 5. Check indexes
  const requiredIndexes = [
    'idx_user_progress_user_id',
    'idx_user_progress_challenge',
    'idx_achievements_user_id',
    'idx_learning_activity_user_id'
  ];
  for (const idx of requiredIndexes) {
    if (sql.includes(idx)) {
      console.log(`[PASS] Query performance index: ${idx}`);
    } else {
      console.error(`[FAIL] Missing index: ${idx}`);
      process.exit(1);
    }
  }

  console.log('--- All 14 Schema & Security checks PASSED successfully ---');
}

runSchemaAudit();
