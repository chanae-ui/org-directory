import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { fetchContacts, triggerSync } from './src/api';
import {
  getInitials,
  getAvatarColor,
  groupByFirstLetter,
  groupBySchool,
  loadFavorites,
  saveFavorites,
} from './src/utils';
import ContactDetail from './src/ContactDetail';
import FilterPicker from './src/FilterPicker';

const NO_SCHOOL = 'ללא שיוך מוסדי';

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [role, setRole] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const [viewMode, setViewMode] = useState('person'); // 'person' | 'institution'
  const [selectedContact, setSelectedContact] = useState(null);
  const sectionListRef = useRef(null);

  useEffect(() => {
    loadFavorites().then(setFavorites);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, city, schoolName, role]);

  async function load() {
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
      setRefreshing(false);
    }
  }

  async function handlePullToRefresh() {
    setRefreshing(true);
    load();
  }

  async function handleSync() {
    setSyncing(true);
    setError(null);
    try {
      await triggerSync();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  }

  async function toggleFavorite(id) {
    const next = new Set(favorites);
    next.has(id) ? next.delete(id) : next.add(id);
    setFavorites(next);
    await saveFavorites(next);
  }

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
  const showFavorites = viewMode === 'person' && !isFiltering && favorites.size > 0;
  const favoriteContacts = useMemo(
    () => contacts.filter((c) => favorites.has(c.id)),
    [contacts, favorites]
  );
  const groupableContacts = showFavorites ? contacts.filter((c) => !favorites.has(c.id)) : contacts;

  const sections = useMemo(() => {
    const result = [];
    if (showFavorites && favoriteContacts.length > 0) {
      result.push({ title: '★ מועדפים', data: favoriteContacts });
    }
    if (isFiltering) {
      result.push({ title: null, data: contacts });
    } else {
      const map = viewMode === 'institution' ? groupBySchool(groupableContacts) : groupByFirstLetter(groupableContacts);
      for (const [key, data] of map.entries()) result.push({ title: key, data });
    }
    return result;
  }, [contacts, groupableContacts, favoriteContacts, showFavorites, isFiltering, viewMode]);

  function clearAllFilters() {
    setSearch('');
    setCity('');
    setSchoolName('');
    setRole('');
  }

  function scrollToSection(index) {
    sectionListRef.current?.scrollToLocation({ sectionIndex: index, itemIndex: 0, viewPosition: 0 });
  }

  function renderItem({ item }) {
    const fullName = `${item.first_name} ${item.last_name}`.trim();
    const avatar = getAvatarColor(fullName);
    const isFav = favorites.has(item.id);
    return (
      <TouchableOpacity style={styles.row} onPress={() => setSelectedContact(item)}>
        <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
          <Text style={[styles.avatarText, { color: avatar.fg }]}>
            {getInitials(item.first_name, item.last_name)}
          </Text>
        </View>
        <View style={styles.rowText}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.meta} numberOfLines={1}>
            {item.role || '—'}{item.school_name ? ` · ${item.school_name}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => toggleFavorite(item.id)}
        >
          <Text style={[styles.star, isFav && styles.starActive]}>{isFav ? '★' : '☆'}</Text>
        </TouchableOpacity>
        <Text style={styles.chevron}>‹</Text>
      </TouchableOpacity>
    );
  }

  if (selectedContact) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ContactDetail contact={selectedContact} onBack={() => setSelectedContact(null)} />
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  const indexKeys =
    !isFiltering && viewMode === 'person'
      ? sections.map((s) => s.title).filter((t, i) => t && !(showFavorites && i === 0))
      : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <View style={styles.viewToggle}>
              <TouchableOpacity
                style={[styles.viewToggleButton, viewMode === 'person' && styles.viewToggleButtonActive]}
                onPress={() => setViewMode('person')}
              >
                <Text style={[styles.viewToggleIcon, viewMode === 'person' && styles.viewToggleIconActive]}>👤</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewToggleButton, viewMode === 'institution' && styles.viewToggleButtonActive]}
                onPress={() => setViewMode('institution')}
              >
                <Text style={[styles.viewToggleIcon, viewMode === 'institution' && styles.viewToggleIconActive]}>🏢</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.syncButton} onPress={handleSync} disabled={syncing}>
              <Text style={styles.syncButtonText}>{syncing ? '⟳' : '↻'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.brand}>
            <Image source={require('./assets/splash-icon.png')} style={styles.brandLogo} />
            <Text style={styles.headerTitle}>אנשי קשר</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="חיפוש"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity style={styles.searchClear} onPress={() => setSearch('')}>
              <Text style={styles.searchClearText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          <FilterPicker label="כל הערים" value={city} onChange={setCity} options={cities} />
          <FilterPicker label="כל בתי הספר" value={schoolName} onChange={setSchoolName} options={schools} />
          <FilterPicker label="כל התפקידים" value={role} onChange={setRole} options={roles} />
        </View>
        {isFiltering ? (
          <TouchableOpacity onPress={clearAllFilters}>
            <Text style={styles.clearAllText}>נקה סינון</Text>
          </TouchableOpacity>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {!loading && !error ? <Text style={styles.resultCount}>{contacts.length} תוצאות</Text> : null}

        <View style={styles.listArea}>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 24 }} />
          ) : (
            <SectionList
              style={styles.list}
              ref={sectionListRef}
              sections={sections}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              renderSectionHeader={({ section }) =>
                section.title ? (
                  <Text style={styles.sectionHeader}>{section.title}</Text>
                ) : null
              }
              stickySectionHeadersEnabled
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handlePullToRefresh} />
              }
              ListEmptyComponent={<Text style={styles.status}>לא נמצאו אנשי קשר.</Text>}
              onScrollToIndexFailed={() => {}}
            />
          )}

          {indexKeys.length > 1 && (
            <View style={styles.alphaIndex}>
              {indexKeys.map((key) => (
                <TouchableOpacity key={key} onPress={() => scrollToSection(sections.findIndex((s) => s.title === key))}>
                  <Text style={styles.alphaIndexText}>{key === NO_SCHOOL ? '·' : key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: RNStatusBar.currentHeight || 0,
  },
  container: { flex: 1, paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#14151a' },
  brand: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  brandLogo: { width: 42, height: 42 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  viewToggle: { flexDirection: 'row', backgroundColor: '#f1f2f5', borderRadius: 10, padding: 2 },
  viewToggleButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  viewToggleButtonActive: { backgroundColor: '#fff' },
  viewToggleIcon: { fontSize: 14, opacity: 0.5 },
  viewToggleIconActive: { opacity: 1 },
  syncButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonText: { color: '#4f46e5', fontSize: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f2f5', borderRadius: 10, marginBottom: 10 },
  searchInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, textAlign: 'right' },
  searchClear: { paddingHorizontal: 12 },
  searchClearText: { color: '#71758a', fontSize: 14 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  clearAllText: { color: '#4f46e5', fontWeight: '600', fontSize: 13, marginBottom: 8, textAlign: 'right' },
  resultCount: { color: '#71758a', fontSize: 12, marginBottom: 8, textAlign: 'right' },
  error: { color: '#b91c1c', backgroundColor: '#fef2f2', padding: 8, borderRadius: 8, marginBottom: 8 },
  status: { color: '#71758a', textAlign: 'center', marginTop: 24 },
  listArea: { flex: 1, flexDirection: 'row' },
  list: { flex: 1 },
  sectionHeader: {
    backgroundColor: '#fff',
    color: '#71758a',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingVertical: 6,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700' },
  rowText: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', textAlign: 'right', color: '#14151a' },
  meta: { fontSize: 13, color: '#71758a', textAlign: 'right' },
  star: { fontSize: 18, color: '#d1d3db' },
  starActive: { color: '#f59e0b' },
  chevron: { color: '#c6c8d2', fontSize: 18 },
  alphaIndex: { width: 20, justifyContent: 'center', alignItems: 'center', gap: 1 },
  alphaIndexText: { color: '#4f46e5', fontSize: 11, fontWeight: '700' },
});
