import { Router } from 'express';
import { pool } from '../db/pool.js';
import { runSync } from '../sync/mondaySync.js';

export const contactsRouter = Router();

// GET /api/contacts?search=...&city=...&institutionCode=...&schoolName=...
contactsRouter.get('/', async (req, res) => {
  const { search, city, institutionCode, schoolName } = req.query;

  const conditions = [];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(
      `(first_name ILIKE $${values.length} OR last_name ILIKE $${values.length} OR school_name ILIKE $${values.length} OR city ILIKE $${values.length})`
    );
  }
  if (city) {
    values.push(city);
    conditions.push(`city = $${values.length}`);
  }
  if (institutionCode) {
    values.push(institutionCode);
    conditions.push(`institution_code = $${values.length}`);
  }
  if (schoolName) {
    values.push(schoolName);
    conditions.push(`school_name = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `SELECT * FROM contacts ${whereClause} ORDER BY last_name, first_name`;

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'שגיאה בשליפת אנשי קשר' });
  }
});

// POST /api/contacts/sync-now - כפתור "רענון ידני" באפליקציה
contactsRouter.post('/sync-now', async (req, res) => {
  try {
    await runSync();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'הסנכרון נכשל' });
  }
});
