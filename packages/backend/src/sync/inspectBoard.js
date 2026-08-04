import dotenv from 'dotenv';

dotenv.config();

const MONDAY_API_URL = 'https://api.monday.com/v2';
const boardId = process.argv[2];

if (!boardId) {
  console.error('שימוש: node src/sync/inspectBoard.js <boardId>');
  process.exit(1);
}

async function main() {
  const apiToken = process.env.MONDAY_API_TOKEN;
  if (!apiToken) {
    throw new Error('חסר MONDAY_API_TOKEN בקובץ .env');
  }

  const query = `
    query ($boardId: [ID!]) {
      boards(ids: $boardId) {
        name
        columns {
          id
          title
          type
        }
        items_page(limit: 3) {
          items {
            name
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
    console.error('שגיאה מ-Monday API:', JSON.stringify(json.errors, null, 2));
    process.exit(1);
  }

  const board = json.data.boards[0];
  if (!board) {
    console.error('לא נמצא לוח עם ה-ID הזה');
    process.exit(1);
  }

  console.log(`\nלוח: ${board.name}\n`);
  console.log('עמודות:');
  for (const col of board.columns) {
    console.log(`  ${col.id}  |  ${col.title}  (${col.type})`);
  }

  console.log('\nדוגמת שורות:');
  for (const item of board.items_page.items) {
    console.log(`  - ${item.name}`);
    for (const cv of item.column_values) {
      if (cv.text) console.log(`      ${cv.id}: ${cv.text}`);
    }
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
