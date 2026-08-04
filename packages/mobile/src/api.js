// כתובת ה-IP המקומית של המחשב ברשת - טלפון לא יכול להתחבר ל-localhost של המחשב.
// אם עוברים לרשת אחרת צריך לעדכן את זה (ipconfig -> IPv4 Address).
const API_BASE_URL = 'http://10.33.195.58:3001';

export async function fetchContacts(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const response = await fetch(`${API_BASE_URL}/api/contacts?${params.toString()}`);
  if (!response.ok) {
    throw new Error('שגיאה בשליפת אנשי קשר');
  }
  return response.json();
}

export async function triggerSync() {
  const response = await fetch(`${API_BASE_URL}/api/contacts/sync-now`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('הסנכרון נכשל');
  }
  return response.json();
}
