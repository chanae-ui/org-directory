import { pathToFileURL } from 'node:url';
import dotenv from 'dotenv';
import { pool } from '../db/pool.js';
import { boardsConfig } from './boardsConfig.js';

dotenv.config();

const MONDAY_API_URL = 'https://api.monday.com/v2';

async function fetchBoardItems(boardId, apiToken, groupId = null) {
  const query = `
    query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        items_page(limit: 500) {
          items {
            id
            name
            group {
              id
            }
            column_values {
              id
              text
            }
          }
        }
      }
    }
  `;

  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiToken,
    },
    body: JSON.stringify({ query, variables: { boardId: [boardId] } }),
  });

  const json = await response.json();

  if (json.errors) {
    throw new Error(`שגיאה מ-Monday API: ${JSON.stringify(json.errors)}`);
  }

  const items = json.data.boards[0].items_page.items;
  // אם הוגדרה groupId בקונפיגורציה של הבורד - מסננים רק את הטבלה (הקבוצה) הזו,
  // כי בורד אחד ב-Monday יכול להכיל כמה "טבלאות" נפרדות (קבוצות) שלא רוצים את כולן.
  return groupId ? items.filter((item) => item.group.id === groupId) : items;
}

const NAME_PREFIXES = ['גב\'', 'גברת', 'מר', 'ד"ר', 'דר\'', 'הרב', 'הרבנית'];

function splitName(fullName, nameOrder = 'firstLast') {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length > 1 && NAME_PREFIXES.includes(parts[0])) {
    parts.shift();
  }
  if (nameOrder === 'lastFirst') {
    const [lastName, ...rest] = parts;
    return { firstName: rest.join(' ') || fullName, lastName: lastName || '' };
  }
  const [firstName, ...rest] = parts;
  return { firstName: firstName || fullName, lastName: rest.join(' ') };
}

// כל בורד מגדיר board.contacts - מערך של "תבניות" איש קשר, כי שורה אחת ב-Monday
// יכולה להכיל כמה אנשי קשר נפרדים (למשל: גם המוסד עצמו וגם המנהל/ת שלו).
function mapItemToContacts(item, board) {
  const colById = Object.fromEntries(item.column_values.map((c) => [c.id, c.text]));
  const shared = board.columnMap || {};
  const schoolName = (shared.school_name && colById[shared.school_name]) || item.name;
  const institutionCode = (shared.institution_code && colById[shared.institution_code]) || null;
  const city = (shared.city && colById[shared.city]) || null;

  return board.contacts
    .map((c) => {
      const rawName = c.nameColumn ? colById[c.nameColumn] : item.name;
      // שורה ב-Monday בלי שם ממולא (או עם שם ה"פריט" ריק) מקבלת מ-Monday את השם הגנרי
      // "Unnamed" - זה לא איש קשר אמיתי (למשל: עדיין לא שובץ יועץ/ת לבית ספר הזה), אז מדלגים עליו.
      if (!rawName || !rawName.trim() || rawName.trim() === 'Unnamed') return null;

      const { firstName, lastName } = splitName(rawName, c.nameOrder);

      return {
        monday_item_id: `${item.id}:${c.idSuffix}`,
        first_name: firstName,
        last_name: lastName,
        role: c.role || board.defaultRole || null,
        school_name: schoolName,
        institution_code: institutionCode,
        city,
        phone: (c.phone && colById[c.phone]) || null,
        email: (c.email && colById[c.email]) || null,
      };
    })
    .filter(Boolean);
}

async function upsertContact(contact) {
  const query = `
    INSERT INTO contacts
      (monday_item_id, first_name, last_name, role, school_name, institution_code, city, phone, email, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
    ON CONFLICT (monday_item_id) DO UPDATE SET
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      role = EXCLUDED.role,
      school_name = EXCLUDED.school_name,
      institution_code = EXCLUDED.institution_code,
      city = EXCLUDED.city,
      phone = EXCLUDED.phone,
      email = EXCLUDED.email,
      updated_at = now();
  `;

  await pool.query(query, [
    contact.monday_item_id,
    contact.first_name,
    contact.last_name,
    contact.role,
    contact.school_name,
    contact.institution_code,
    contact.city,
    contact.phone,
    contact.email,
  ]);
}

export async function runSync() {
  const apiToken = process.env.MONDAY_API_TOKEN;

  if (!apiToken) {
    throw new Error('חסר MONDAY_API_TOKEN בקובץ .env');
  }

  const activeBoards = boardsConfig.filter((board) => board.boardId);
  if (activeBoards.length === 0) {
    throw new Error('לא הוגדר אף בורד ב-boardsConfig.js (כולם עם boardId ריק)');
  }

  console.log(`מתחיל סנכרון מ-Monday (${activeBoards.length} בורדים)...`);

  for (const board of activeBoards) {
    console.log(`בורד "${board.boardName}" (${board.boardId})...`);
    const items = await fetchBoardItems(board.boardId, apiToken, board.groupId);
    console.log(`  נמצאו ${items.length} פריטים`);

    for (const item of items) {
      for (const contact of mapItemToContacts(item, board)) {
        await upsertContact(contact);
      }
    }
  }

  console.log('הסנכרון הושלם בהצלחה');
}

// מאפשר להריץ סנכרון ידני: npm run sync
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSync()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('הסנכרון נכשל:', err);
      process.exit(1);
    });
}
