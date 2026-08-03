export async function fetchContacts(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const response = await fetch(`/api/contacts?${params.toString()}`);
  if (!response.ok) {
    throw new Error('שגיאה בשליפת אנשי קשר');
  }
  return response.json();
}

export async function triggerSync() {
  const response = await fetch('/api/contacts/sync-now', { method: 'POST' });
  if (!response.ok) {
    throw new Error('הסנכרון נכשל');
  }
  return response.json();
}
