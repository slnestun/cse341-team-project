import { afterAll, beforeAll, beforeEach, inject } from 'vitest';
import { closeDb, connectToDb, getDb } from '../src/db/connect.js';
import { initializeDatabase } from '../src/db/initialize.js';
import { closeMongoose, connectMongoose } from '../src/db/mongoose.js';

process.env.SESSION_SECRET = 'test-session-secret';

const connectionString = inject('MONGODB_TEST_URI');

beforeAll(async () => {
  await connectToDb({
    connectionString,
    databaseName: 'kizuna-rail-test'
  });

  await connectMongoose({
    connectionString,
    databaseName: 'kizuna-rail-test'
  });
});

beforeEach(async () => {
  const db = getDb();
  await db.dropDatabase();
  await initializeDatabase(db);
});

afterAll(async () => {
  await closeMongoose();
  await closeDb();
});
