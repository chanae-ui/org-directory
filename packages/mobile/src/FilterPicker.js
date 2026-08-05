import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Pressable } from 'react-native';

export default function FilterPicker({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);

  function select(v) {
    onChange(v);
    setOpen(false);
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.wrap, value && styles.wrapActive]}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.label, value && styles.labelActive]} numberOfLines={1}>
          {value || label}
        </Text>
        <Text style={[styles.chevron, value && styles.chevronActive]}>⌄</Text>
        {value ? (
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearButton}
            onPress={() => onChange('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{label}</Text>
            <FlatList
              data={['', ...options]}
              keyExtractor={(item) => item || '__all__'}
              style={styles.list}
              renderItem={({ item }) => {
                const isSelected = item === value;
                return (
                  <TouchableOpacity style={styles.option} onPress={() => select(item)}>
                    <Text style={styles.optionCheck}>{isSelected ? '✓' : ''}</Text>
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item || label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e6e7eb',
    minWidth: 110,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  wrapActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  label: { color: '#14151a', fontSize: 13, flexShrink: 1, textAlign: 'right' },
  labelActive: { color: '#fff', fontWeight: '600' },
  chevron: { color: '#71758a', fontSize: 12 },
  chevronActive: { color: '#fff' },
  clearButton: { marginRight: 4 },
  clearButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(20,21,26,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e6e7eb',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#14151a',
    textAlign: 'right',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  list: { paddingHorizontal: 8 },
  option: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
  },
  optionCheck: { width: 18, color: '#4f46e5', fontWeight: '700', textAlign: 'center' },
  optionText: { flex: 1, fontSize: 16, color: '#14151a', textAlign: 'right' },
  optionTextSelected: { color: '#4f46e5', fontWeight: '700' },
});
