/**
 * רשימת כל הבורדים ב-Workspace שרוצים לסנכרן, כל אחד עם מיפוי עמודות משלו
 * (כי לכל בורד יש טבלה/מבנה עמודות שונה).
 *
 * להוסיף כאן אובייקט אחד לכל בורד. שדות ב-columnMap שלא קיימים בבורד
 * הספציפי אפשר להשאיר null - הם פשוט יישמרו כ-null במסד הנתונים.
 *
 * למצוא Column ID: בלוח ב-Monday -> שלוש נקודות ליד העמודה -> "עוד" -> "Column ID".
 */
export const boardsConfig = [
  {
    boardId: '', // TODO: למלא Board ID אמיתי
    boardName: 'לדוגמה - מורים', // לתיעוד בלבד, לא נשמר במסד הנתונים
    defaultRole: null, // אם אין עמודת תפקיד בבורד הזה, אפשר לקבע כאן ערך קבוע (למשל 'מורה')
    columnMap: {
      role: null,
      school_name: null,
      institution_code: null,
      city: null,
      phone: null,
      email: null,
    },
  },
];
