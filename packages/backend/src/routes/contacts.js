import { Router } from 'express';
import { pool } from '../db/pool.js';
import { runSync } from '../sync/mondaySync.js';

export const contactsRouter = Router();

// שדה חיפוש חכם אחד: מפצל לכמה מילים (כל מילה חייבת להתאים למשהו - AND ביניהן),
// ולכל מילה בוחר אם לחפש בשדות מספריים (סמל מוסד/טלפון) או טקסטואליים,
// לפי אם המילה עצמה מורכבת מספרות בלבד.
function buildSmartSearchConditions(search, values) {
  const terms = search.trim().split(/\s+/).filter(Boolean);

  return terms.map((term) => {
    values.push(`%${term}%`);
    const i = values.length;
    if (/^\d+$/.test(term)) {
      return `(institution_code ILIKE $${i} OR phone ILIKE $${i})`;
    }
    return `(first_name ILIKE $${i} OR last_name ILIKE $${i} OR school_name ILIKE $${i} OR city ILIKE $${i} OR role ILIKE $${i})`;
  });
}

// GET /api/contacts?search=...&city=...&institutionCode=...&schoolName=...&role=...
contactsRouter.get('/', async (req, res) => {
  const { search, city, institutionCode, schoolName, role } = req.query;

  const conditions = [];
  const values = [];

  if (search) {
    conditions.push(...buildSmartSearchConditions(search, values));
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
  if (role) {
    values.push(role);
    conditions.push(`role = $${values.length}`);
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
