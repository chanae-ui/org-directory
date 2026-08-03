import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchContacts, triggerSync } from './api.js';
import ContactDetail from './ContactCard.jsx';
import { getInitials, getAvatarColor, groupByFirstLetter } from './utils.js';
import { IconSearch, IconChevronLeft, IconRefresh } from './icons.jsx';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const sectionRefs = useRef(new Map());
  const scrollRef = useRef(null);

  async function loadContacts() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContacts({ search, city, schoolName });
      data.sort((a, b) => (a.first_name || '').localeCompare(b.first_name || '', 'he'));
      setContacts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(loadContacts, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, city, schoolName]);

  const cities = useMemo(
    () => [...new Set(contacts.map((c) => c.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'he')),
    [contacts]
  );
  const schools = useMemo(
    () => [...new Set(contacts.map((c) => c.school_name).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'he')),
    [contacts]
  );

  const isFiltering = Boolean(search || city || schoolName);
  const groups = useMemo(() => groupByFirstLetter(contacts), [contacts]);
  const letters = useMemo(() => [...groups.keys()], [groups]);

  async function handleSync() {
    setSyncing(true);
    setError(null);
    try {
      await triggerSync();
      await loadContacts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  function scrollToLetter(letter) {
    const node = sectionRefs.current.get(letter);
    if (node && scrollRef.current) {
      scrollRef.current.scrollTo({ top: node.offsetTop - 8, behavior: 'smooth' });
    }
  }

  function renderRow(contact) {
    const fullName = `${contact.first_name} ${contact.last_name}`.trim();
    const avatar = getAvatarColor(fullName);
    return (
      <li
        key={contact.id}
        className={`contact-row ${selectedContact?.id === contact.id ? 'selected' : ''}`}
        onClick={() => setSelectedContact(contact)}
      >
        <span className="avatar" style={{ background: avatar.bg, color: avatar.fg }}>
          {getInitials(contact.first_name, contact.last_name)}
        </span>
        <span className="contact-text">
          <span className="contact-name">{fullName}</span>
          <span className="contact-meta">{contact.role || '—'}{contact.school_name ? ` · ${contact.school_name}` : ''}</span>
        </span>
        <IconChevronLeft className="chevron" />
      </li>
    );
  }

  return (
    <div className="app-shell">
      <div className="list-pane">
        <div className="app-screen" ref={scrollRef}>
          <header className="header">
            <h1>אנשי קשר</h1>
            <button className="sync-button" onClick={handleSync} disabled={syncing} aria-label="רענון">
              <IconRefresh className={syncing ? 'spin' : ''} />
            </button>
          </header>

          <div className="search-bar">
            <IconSearch className="search-icon" />
            <input
              type="text"
              placeholder="חיפוש"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-chips">
            <select value={city} onChange={(e) => setCity(e.target.value)} className={city ? 'chip active' : 'chip'}>
              <option value="">כל הערים</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className={schoolName ? 'chip active' : 'chip'}>
              <option value="">כל בתי הספר</option>
              {schools.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {error && <p className="error">{error}</p>}
          {loading && <p className="status">טוען...</p>}
          {!loading && contacts.length === 0 && <p className="status">לא נמצאו אנשי קשר.</p>}

          {isFiltering ? (
            <ul className="contact-list">
              {contacts.map(renderRow)}
            </ul>
          ) : (
            [...groups.entries()].map(([letter, group]) => (
              <div key={letter} ref={(el) => sectionRefs.current.set(letter, el)}>
                <div className="section-header">{letter}</div>
                <ul className="contact-list">
                  {group.map(renderRow)}
                </ul>
              </div>
            ))
          )}
        </div>

        {!isFiltering && letters.length > 1 && (
          <div className="alpha-index">
            {letters.map((letter) => (
              <button key={letter} onClick={() => scrollToLetter(letter)}>{letter}</button>
            ))}
          </div>
        )}
      </div>

      <div className={`detail-pane ${selectedContact ? 'active' : ''}`}>
        {selectedContact ? (
          <ContactDetail
            key={selectedContact.id}
            contact={selectedContact}
            onClose={() => setSelectedContact(null)}
          />
        ) : (
          <div className="empty-state">בחרי איש קשר כדי לראות פרטים</div>
        )}
      </div>
    </div>
  );
}
