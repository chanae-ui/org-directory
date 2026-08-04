import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { getInitials, getAvatarColor } from './utils';

export default function ContactDetail({ contact, onBack }) {
  const fullName = `${contact.first_name} ${contact.last_name}`.trim();
  const avatar = getAvatarColor(fullName);

  const fields = [
    { label: 'תפקיד', value: contact.role },
    { label: 'בית ספר / מוסד', value: contact.school_name },
    { label: 'סמל מוסד', value: contact.institution_code },
    { label: 'עיר', value: contact.city },
    { label: 'טלפון', value: contact.phone },
    { label: 'מייל', value: contact.email },
  ].filter((f) => f.value);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ חזרה</Text>
      </TouchableOpacity>

      <View style={styles.hero}>
        <View style={[styles.avatarLarge, { backgroundColor: avatar.bg }]}>
          <Text style={[styles.avatarLargeText, { color: avatar.fg }]}>
            {getInitials(contact.first_name, contact.last_name)}
          </Text>
        </View>
        <Text style={styles.name}>{fullName}</Text>
        {contact.role ? <Text style={styles.role}>{contact.role}</Text> : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          disabled={!contact.phone}
          onPress={() => Linking.openURL(`tel:${contact.phone}`)}
        >
          <View style={[styles.actionCircle, styles.callCircle, !contact.phone && styles.disabled]}>
            <Text style={styles.actionIcon}>📞</Text>
          </View>
          <Text style={styles.actionLabel}>התקשרות</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          disabled={!contact.email}
          onPress={() => Linking.openURL(`mailto:${contact.email}`)}
        >
          <View style={[styles.actionCircle, styles.mailCircle, !contact.email && styles.disabled]}>
            <Text style={styles.actionIcon}>✉️</Text>
          </View>
          <Text style={styles.actionLabel}>מייל</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoList}>
        {fields.map((f, index) => (
          <View
            key={f.label}
            style={[styles.infoRow, index === fields.length - 1 && styles.infoRowLast]}
          >
            <Text style={styles.infoLabel}>{f.label}</Text>
            <Text style={styles.infoValue}>{f.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  backButton: { paddingVertical: 4, marginBottom: 8 },
  backButtonText: { color: '#4f46e5', fontSize: 16, fontWeight: '600' },
  hero: { alignItems: 'center', marginVertical: 16 },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: { fontSize: 28, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', marginTop: 12, color: '#14151a' },
  role: { fontSize: 14, color: '#71758a', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 44, marginBottom: 28 },
  actionButton: { alignItems: 'center', gap: 6 },
  actionCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callCircle: { backgroundColor: '#16a34a' },
  mailCircle: { backgroundColor: '#4f46e5' },
  disabled: { opacity: 0.35 },
  actionIcon: { fontSize: 22 },
  actionLabel: { fontSize: 12, color: '#14151a' },
  infoList: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0f0f1',
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeef',
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { color: '#71758a', fontSize: 14 },
  infoValue: { color: '#14151a', fontSize: 14, fontWeight: '600' },
});
