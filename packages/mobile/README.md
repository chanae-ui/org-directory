# Mobile - אלפון ארגוני

אפליקציית React Native (Expo) שמציגה את אותם הנתונים כמו ה-Web, מול אותו Backend.

## הרצה

```bash
npm run start --workspace=packages/mobile
```

זה יפתח את Expo Dev Tools בדפדפן עם קוד QR. לבדיקה על טלפון אמיתי:
1. להתקין את אפליקציית **Expo Go** מה-App Store / Google Play.
2. לוודא שהטלפון מחובר **לאותה רשת Wi-Fi** של המחשב.
3. לסרוק את קוד ה-QR עם מצלמת הטלפון (iOS) או מתוך Expo Go (Android).

## חיבור ל-Backend

בקובץ [src/api.js](src/api.js) יש כתובת בסיס (`API_BASE_URL`) שמצביעה על כתובת ה-IP המקומית של המחשב בתוך הרשת (לא `localhost` - טלפון לא יכול "לראות" את ה-localhost של המחשב). אם כתובת ה-IP של המחשב משתנה (רשת אחרת, ראוטר אחר) - צריך לעדכן את זה שם.

למצוא את כתובת ה-IP הנוכחית: `ipconfig` בטרמינל, לחפש "IPv4 Address" מתחת לרשת ה-Wi-Fi הפעילה.
