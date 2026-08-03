# Backend - אלפון ארגוני

## התקנה ראשונית
```bash
npm install
cp .env.example .env
```
ואז למלא ב-`.env` את `MONDAY_API_TOKEN` ו-`DATABASE_URL`.

## הקמת מסד הנתונים
צריך PostgreSQL רץ, ולהריץ פעם אחת:
```bash
psql "$DATABASE_URL" -f src/db/schema.sql
```

## לפני סנכרון ראשון
לפתוח את `src/sync/boardsConfig.js` ולהוסיף אובייקט לכל בורד שרוצים לסנכרן: `boardId` האמיתי, ו-`columnMap` עם ה-Column ID האמיתיים של אותו בורד. בורדים בלי `boardId` מתעלמים מהם בסנכרון, כך שאפשר להוסיף בורדים בהדרגה ככל שהמיפוי מתברר.

## הרצה
```bash
npm run dev        # מפעיל את השרת עם ריענון אוטומטי
npm run sync        # מריץ סנכרון ידני חד-פעמי (לבדיקה)
```

## נקודות קצה (API)
- `GET /api/contacts` - כל אנשי הקשר
- `GET /api/contacts?search=כהן` - חיפוש חופשי
- `GET /api/contacts?city=ירושלים&institutionCode=123456` - סינון משולב
- `POST /api/contacts/sync-now` - סנכרון ידני (כפתור "רענון" באפליקציה)
