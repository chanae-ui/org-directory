-- טבלת אנשי הקשר של הארגון
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  monday_item_id TEXT UNIQUE NOT NULL, -- מזהה הפריט המקורי ב-Monday, לזיהוי בעדכון
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT,               -- תפקיד: מורה / מנהל / יועץ / עובד מטה וכו'
  school_name TEXT,         -- שם בית הספר / מוסד
  institution_code TEXT,    -- סמל המוסד
  city TEXT,                -- עיר מגורים
  phone TEXT,
  email TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- אינדקסים על השדות שלפיהם מחפשים ומסננים הכי הרבה
CREATE INDEX IF NOT EXISTS idx_contacts_last_name ON contacts (last_name);
CREATE INDEX IF NOT EXISTS idx_contacts_city ON contacts (city);
CREATE INDEX IF NOT EXISTS idx_contacts_institution_code ON contacts (institution_code);
CREATE INDEX IF NOT EXISTS idx_contacts_school_name ON contacts (school_name);

-- אינדקס טקסט חופשי לחיפוש מהיר על כמה שדות בו-זמנית
CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts
  USING GIN (to_tsvector('simple', first_name || ' ' || last_name || ' ' || coalesce(school_name, '') || ' ' || coalesce(city, '')));
