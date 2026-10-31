import { initDB } from '../config/db.js';

console.log('[Seed] Starting database migration & seed process...');
try {
  await initDB();
  console.log('[Seed] Seed script successfully initialized.');
  process.exit(0);
} catch (error) {
  console.error('[Seed] Error running seed script:', error);
  process.exit(1);
}

