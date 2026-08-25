import { useState } from 'react';
import { Alert, SafeAreaView, StatusBar, Text } from 'react-native';
import { AddSheet } from '../src/AddSheet';
import { EditSheet, Home, Onboarding, useAppStyles } from '../App';
import { dayKey, entriesForDay } from '../src/date';
import { Entry } from '../src/types';
import { useRemainingData } from '../src/useRemainingData';
import { useTheme } from '../src/theme';

export default function HomeRoute() {
  const styles = useAppStyles();
  const { isDark } = useTheme();
  const { data, update } = useRemainingData();
  const [editing, setEditing] = useState<Entry | null>(null);
  const [adding, setAdding] = useState(false);
  if (!data) return <SafeAreaView style={styles.loading}><Text style={styles.brand}>Remaining</Text></SafeAreaView>;
  if (data.target <= 0) return <Onboarding onDone={(target) => update({ ...data, target })} />;
  const today = entriesForDay(data.entries, dayKey());
  const consumed = today.reduce((total, entry) => total + entry.calories, 0);
  const saveEdit = (entry: Entry, name: string, calories: number) => update({ ...data, entries: data.entries.map((item) => item.id === entry.id ? { ...item, name, calories } : item) });
  const deleteEntry = (entry: Entry) => Alert.alert('Delete entry?', `${entry.name} will be removed.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => update({ ...data, entries: data.entries.filter((item) => item.id !== entry.id) }) }]);
  const addEntry = (name: string, calories: number) => update({ ...data, entries: [{ id: `${Date.now()}-${Math.random()}`, name, calories, createdAt: new Date().toISOString() }, ...data.entries] });
  return <SafeAreaView style={styles.app}><StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} /><Home target={data.target} left={data.target - consumed} entries={today} onEdit={setEditing} onAdd={() => setAdding(true)} /><AddSheet visible={adding} onClose={() => setAdding(false)} onSave={addEntry} /><EditSheet entry={editing} onClose={() => setEditing(null)} onSave={saveEdit} onDelete={deleteEntry} /></SafeAreaView>;
}
