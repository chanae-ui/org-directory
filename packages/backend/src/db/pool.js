import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Pool מנוהל של חיבורים למסד הנתונים - נשתמש בו בכל מקום בקוד
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
