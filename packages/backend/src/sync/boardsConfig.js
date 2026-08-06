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
      // שדות "מוסדיים" משותפים - אין כאלה בבורד הזה
      city: 'text_mm52533c', // ישוב
    },
    contacts: [
      {
        idSuffix: 'main',
        nameColumn: null, // השם של הפריט עצמו הוא שם המפקח/ת
        phone: 'text_mm52a8n1', // נייד
        email: 'text_mm52zgrt', // מייל
      },
    ],
  },
  {
    boardId: '5100219078',
    boardName: 'בתי ספר',
    columnMap: {
      // שדות "מוסדיים" משותפים לשני אנשי הקשר שנגזרים מכל שורה
      school_name: null, // אין עמודה נפרדת - שם הפריט עצמו הוא שם המוסד
      institution_code: 'text_mm5736hf', // סמל מוסד
      city: 'text_mm571fj5', // ישוב
    },
    contacts: [
      {
        idSuffix: 'institution',
        nameColumn: null, // שם המוסד עצמו (שם הפריט) משמש כ"שם" איש הקשר
        role: 'מוסד',
        phone: 'text_mm57gryq', // טלפון מוסד
        email: 'text_mm57t082', // מייל בית הספר
      },
      {
        idSuffix: 'principal',
        nameColumn: 'text_mm57z7zg', // שם מנהל/ת - בסדר "פרטי משפחה" (יסודרו כך ב-Monday)
        role: 'מנהל/ת בית ספר',
        phone: 'text_mm57v1w0', // נייד מנהל/ת
        email: null,
      },
    ],
  },
  {
    boardId: '5099853349',
    boardName: 'יועצות',
    // בבורד הזה יש כמה טבלאות (קבוצות) נפרדות - מסנכרנים רק את "רשימת יועצות ויועצים בחינוך העצמאי"
    groupId: 'group_mm5z39sp',
    defaultRole: 'יועץ/ת חינוכי/ת',
    columnMap: {
      school_name: 'text_mm51ed8w', // שם בית ספר
      institution_code: 'text_mm5n79vp', // סמל מוסד
      city: 'text_mm512hmh', // עיר
    },
    contacts: [
      {
        idSuffix: 'main',
        nameColumn: null, // השם של הפריט עצמו הוא שם היועץ/ת
        phone: 'text_mm51a9av', // טלפון יועצת
        email: 'email_mm511t41', // מייל יועצת
      },
    ],
  },
];
