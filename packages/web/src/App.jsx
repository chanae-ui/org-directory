import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchContacts, triggerSync } from './api.js';
import ContactDetail from './ContactCard.jsx';
import {
  getInitials,
  getAvatarColor,
  groupByFirstLetter,
  groupBySchool,
  loadFavorites,
  saveFavorites,
} from './utils.js';
import { IconSearch, IconChevronLeft, IconRefresh, IconX, IconStar, IconUser, IconBuilding } from './icons.jsx';
import FilterDropdown from './FilterDropdown.jsx';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [role, setRole] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [favorites, setFavorites] = useState(() => loadFavorites());
  const [viewMode, setViewMode] = useState('person'); // 'person' | 'institution'
  const sectionRefs = useRef(new Map());
  const scrollRef = useRef(null);
  const searchInputRef = useRef(null);

  async function loadContacts() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchContacts({ search, city, schoolName, role });
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
  }, [search, city, schoolName, role]);

  // קיצור מקלדת: "/" קופץ ישר לשדה החיפוש (כמו ברוב האפליקציות)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== '/') return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      searchInputRef.current?.focus();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const cities = useMemo(
    () => [...new Set(contacts.map((c) => c.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'he')),
    [contacts]
  );
  const schools = useMemo(
    () => [...new Set(contacts.map((c) => c.school_name).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'he')),
    [contacts]
  );
  const roles = useMemo(
    () => [...new Set(contacts.map((c) => c.role).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'he')),
    [contacts]
  );

  const isFiltering = Boolean(search || city || schoolName || role);
  const showFavoritesSection = viewMode === 'person' && !isFiltering && favorites.size > 0;
  const favoriteContacts = useMemo(
    () => contacts.filter((c) => favorites.has(c.id)),
    [contacts, favorites]
  );
  // כשמציגים סקציית "מועדפים" למעלה, לא מציגים את אותם אנשי קשר שוב במקום הרגיל שלהם ברשימה
  const groupableContacts = showFavoritesSection
    ? contacts.filter((c) => !favorites.has(c.id))
    : contacts;
  const groups = useMemo(
    () => (viewMode === 'institution' ? groupBySchool(groupableContacts) : groupByFirstLetter(groupableContacts)),
    [groupableContacts, viewMode]
  );
  const groupKeys = useMemo(() => [...groups.keys()], [groups]);

  function toggleFavorite(id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      saveFavorites(next);
      return next;
    });
  }

  function clearAllFilters() {
    setSearch('');
    setCity('');
    setSchoolName('');
    setRole('');
  }

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

  function scrollToGroup(key) {
    const node = sectionRefs.current.get(key);
    if (node && scrollRef.current) {
      scrollRef.current.scrollTo({ top: node.offsetTop - 8, behavior: 'smooth' });
    }
  }

  function renderRow(contact) {
    const fullName = `${contact.first_name} ${contact.last_name}`.trim();
    const avatar = getAvatarColor(fullName);
    const isFavorite = favorites.has(contact.id);
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
        <button
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(contact.id);
          }}
          aria-label={isFavorite ? 'הסרה מהמועדפים' : 'הוספה למועדפים'}
        >
          <IconStar filled={isFavorite} />
        </button>
        <IconChevronLeft className="chevron" />
      </li>
    );
  }

  function renderFilterSelect(value, onChange, allLabel, options) {
    return <FilterDropdown label={allLabel} value={value} onChange={onChange} options={options} />;
  }

  return (
    <div className="app-shell">
      <div className="list-pane">
        <div className="app-screen" ref={scrollRef}>
          <header className="header">
            <h1>אנשי קשר</h1>
            <div className="header-actions">
              <div className="view-toggle">
                <button
                  className={viewMode === 'person' ? 'active' : ''}
                  onClick={() => setViewMode('person')}
                  aria-label="לפי אנשים"
                >
                  <IconUser />
                </button>
                <button
                  className={viewMode === 'institution' ? 'active' : ''}
                  onClick={() => setViewMode('institution')}
                  aria-label="לפי מוסד"
                >
                  <IconBuilding />
                </button>
              </div>
              <button className="sync-button" onClick={handleSync} disabled={syncing} aria-label="רענון">
                <IconRefresh className={syncing ? 'spin' : ''} />
              </button>
            </div>
          </header>

          <div className="search-bar">
            <IconSearch className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="חיפוש"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search ? (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="נקה חיפוש">
                <IconX />
              </button>
            ) : (
              <kbd className="shortcut-hint">/</kbd>
            )}
          </div>

          <div className="filter-chips">
            {renderFilterSelect(city, setCity, 'כל הערים', cities)}
            {renderFilterSelect(schoolName, setSchoolName, 'כל בתי הספר', schools)}
            {renderFilterSelect(role, setRole, 'כל התפקידים', roles)}
            {isFiltering && (
              <button className="clear-all-button" onClick={clearAllFilters}>
                נקה סינון
              </button>
            )}
          </div>

          {!loading && !error && (
            <p className="result-count">{contacts.length} תוצאות</p>
          )}
          {error && <p className="error">{error}</p>}
          {loading && <p className="status">טוען...</p>}
          {!loading && contacts.length === 0 && <p className="status">לא נמצאו אנשי קשר.</p>}

          {showFavoritesSection && favoriteContacts.length > 0 && (
            <div>
              <div className="section-header favorites-header">
                <IconStar filled className="favorites-star" /> מועדפים
              </div>
              <ul className="contact-list">
                {favoriteContacts.map(renderRow)}
              </ul>
            </div>
          )}

          {viewMode === 'person' && isFiltering ? (
            <ul className="contact-list">
              {contacts.map(renderRow)}
            </ul>
          ) : (
            [...groups.entries()].map(([key, group]) => (
              <div key={key} ref={(el) => sectionRefs.current.set(key, el)}>
                <div className="section-header">{key}</div>
                <ul className="contact-list">
                  {group.map(renderRow)}
                </ul>
              </div>
            ))
          )}
        </div>

        {viewMode === 'person' && !isFiltering && groupKeys.length > 1 && (
          <div className="alpha-index">
            {groupKeys.map((key) => (
              <button key={key} onClick={() => scrollToGroup(key)}>{key}</button>
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
