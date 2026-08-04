const AVATAR_PALETTE = [
  { bg: '#EEF2FF', fg: '#4F46E5' },
  { bg: '#FFF7ED', fg: '#EA580C' },
  { bg: '#ECFDF5', fg: '#059669' },
  { bg: '#FDF2F8', fg: '#DB2777' },
  { bg: '#EFF6FF', fg: '#2563EB' },
  { bg: '#F5F3FF', fg: '#7C3AED' },
  { bg: '#FEF2F2', fg: '#DC2626' },
  { bg: '#F0FDFA', fg: '#0D9488' },
];

export function getInitials(firstName, lastName) {
  const a = (firstName || '').trim()[0] || '';
  const b = (lastName || '').trim()[0] || '';
  return (a + b).toUpperCase() || '?';
}

export function getAvatarColor(name) {
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export function groupByFirstLetter(contacts) {
  const groups = new Map();
  for (const contact of contacts) {
    const letter = (contact.first_name || '?').trim()[0]?.toUpperCase() || '?';
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter).push(contact);
  }
  return groups;
}

const NO_SCHOOL = 'ללא שיוך מוסדי';

export function groupBySchool(contacts) {
  const sorted = [...contacts].sort((a, b) =>
    (a.school_name || NO_SCHOOL).localeCompare(b.school_name || NO_SCHOOL, 'he')
  );
  const groups = new Map();
  for (const contact of sorted) {
    const key = contact.school_name || NO_SCHOOL;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(contact);
  }
  // בתוך כל מוסד - שורת "המוסד" עצמה קודם, ואז שאר אנשי הקשר
  for (const list of groups.values()) {
    list.sort((a, b) => (a.role === 'מוסד' ? -1 : 0) - (b.role === 'מוסד' ? -1 : 0));
  }
  return groups;
}

const FAVORITES_KEY = 'org-directory:favorites';

export function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveFavorites(set) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...set]));
}
