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
    boardId: '5099869449',
    boardName: 'מפקחים',
    defaultRole: 'מפקח/ת',
    columnMap: {
      role: null,
      school_name: null,
      institution_code: null,
      city: 'text_mm52533c', // ישוב
      phone: 'text_mm52a8n1', // נייד
      email: 'text_mm52zgrt', // מייל
    },
  },
];
