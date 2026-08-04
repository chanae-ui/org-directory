import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function FilterPicker({ label, value, onChange, options }) {
  return (
    <View style={[styles.wrap, value && styles.wrapActive]}>
      <Picker
        selectedValue={value}
        onValueChange={onChange}
        style={styles.picker}
        dropdownIconColor={value ? '#fff' : '#71758a'}
      >
        <Picker.Item label={label} value="" />
        {options.map((o) => (
          <Picker.Item key={o} label={o} value={o} />
        ))}
      </Picker>
      {value ? (
        <TouchableOpacity style={styles.clearButton} onPress={() => onChange('')}>
          <Text style={styles.clearButtonText}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e6e7eb',
    minWidth: 110,
  },
  wrapActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  picker: {
    flex: 1,
    color: '#14151a',
    height: 36,
  },
  clearButton: { paddingHorizontal: 10 },
  clearButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
