import { useEffect, useMemo, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Svg, { Circle } from 'react-native-svg';
import { Button, Field, SectionTitle } from './src/components';
import { caloriesForDay, dateLabel, dayKey, timeLabel } from './src/date';
import { spacing, ThemeColors, useTheme } from './src/theme';
import { Entry } from './src/types';

const RING_SIZE = 224;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function Onboarding({ onDone }: { onDone: (target: number) => void }) {
  const styles = useAppStyles();
  const [target, setTarget] = useState('2000');
  return <SafeAreaView style={styles.onboarding}><View><Text style={styles.brand}>Remaining</Text><Text style={styles.onboardTitle}>A simple daily balance.</Text><Text style={styles.onboardCopy}>Set the calories you want to keep for each day.</Text></View><View style={styles.onboardBottom}><Field label="Daily calorie target" value={target} onChangeText={setTarget} keyboardType="numeric" autoFocus /><Button label="Continue" onPress={() => { const number = Number(target); if (number > 0) onDone(Math.round(number)); else Alert.alert('Enter a daily target'); }} /></View></SafeAreaView>;
}

export function Home({ target, left, entries, onEdit, onAdd }: { target: number; left: number; entries: Entry[]; onEdit: (entry: Entry) => void; onAdd?: () => void }) {
  const { colors } = useTheme();
  const styles = useAppStyles();
  const statusColor = left < 0 ? colors.red : left <= target * 0.15 ? colors.amber : colors.ink;
  const ringColor = left < 0 ? colors.red : left <= target * 0.15 ? colors.amber : colors.muted;
  const remainingRatio = Math.max(0, Math.min(left / target, 1));
  const dashOffset = RING_CIRCUMFERENCE * (1 - remainingRatio);
  return <View style={styles.page}><Text style={styles.today}>Today</Text><View style={styles.balance}><View accessibilityLabel={`${Math.max(left, 0)} calories left out of ${target}`} style={styles.balanceRing}><Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringCanvas}><Circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS} stroke={ringColor} strokeWidth={RING_STROKE} strokeOpacity={0.72} strokeLinecap="round" fill="none" strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`} strokeDashoffset={dashOffset} transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`} /></Svg><View style={styles.balanceContent}><View style={styles.balanceLine}><Text style={[styles.balanceNumber, { color: statusColor }]}>{Math.abs(left).toLocaleString()}</Text><Text style={[styles.balanceWord, { color: statusColor }]}>{left >= 0 ? 'left' : 'over'}</Text></View><Text style={styles.targetText}>{target.toLocaleString()} daily target</Text></View></View></View><View style={styles.listHeader}><SectionTitle>Logged today</SectionTitle>{onAdd && <Pressable accessibilityLabel="Add calories" onPress={onAdd} style={({ pressed }) => [styles.addIconButton, pressed && styles.iconPressed]}><SymbolView name="plus" size={22} weight="semibold" tintColor={colors.surface} fallback={<Text style={styles.plusFallback}>+</Text>} /></Pressable>}</View><View style={styles.list}>{entries.length ? entries.map((entry) => <Pressable key={entry.id} onPress={() => onEdit(entry)} style={styles.entry}><View><Text style={styles.entryName}>{entry.name}</Text><Text style={styles.entryTime}>{timeLabel(entry.createdAt)}</Text></View><Text style={styles.entryCalories}>{entry.calories.toLocaleString()}</Text></Pressable>) : <Text style={styles.empty}>Nothing logged yet.</Text>}</View></View>;
}

export function History({ target, entries }: { target: number; entries: Entry[] }) {
  const { colors } = useTheme();
  const styles = useAppStyles();
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - index); return dayKey(date); });
  return <View style={styles.page}><Text style={styles.pageTitle}>History</Text><Text style={styles.pageCopy}>The last seven days.</Text><View style={styles.historyList}>{days.map((day) => { const total = caloriesForDay(entries, day); const ratio = Math.min(total / target, 1); return <View key={day} style={styles.historyRow}><View style={styles.historyHeader}><Text style={styles.historyDate}>{day === dayKey() ? 'Today' : dateLabel(day)}</Text><Text style={styles.historyCalories}>{total.toLocaleString()} / {target.toLocaleString()}</Text></View><View style={styles.barTrack}><View style={[styles.bar, { width: `${ratio * 100}%`, backgroundColor: total > target ? colors.red : colors.accent }]} /></View></View>; })}</View></View>;
}

export function Settings({ target, onTarget, onClear }: { target: number; onTarget: (value: number) => void; onClear: () => void }) {
  const styles = useAppStyles();
  const [value, setValue] = useState(String(target));
  const [saved, setSaved] = useState(false);
  const saveTarget = () => { Keyboard.dismiss(); const next = Number(value); if (next > 0) { onTarget(Math.round(next)); setSaved(true); setTimeout(() => setSaved(false), 800); } else Alert.alert('Enter a valid target'); };
  return <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}><View style={styles.page}><Text style={styles.pageTitle}>Settings</Text><View style={styles.settingsGroup}><Field label="Daily calorie target" value={value} onChangeText={(text) => { setSaved(false); setValue(text); }} keyboardType="numeric" /><Button quiet label="Save target" success={saved} onPress={saveTarget} /></View><View style={styles.divider} /><View style={styles.settingsGroup}><SectionTitle>Units</SectionTitle><Text style={styles.settingValue}>Calories (kcal)</Text></View><View style={styles.danger}><SectionTitle>Data</SectionTitle><Text style={styles.pageCopy}>Remove your target and all saved entries from this device.</Text><Button quiet destructive label="Clear all local data" onPress={onClear} /></View></View></TouchableWithoutFeedback>;
}

export function EditSheet({ entry, onClose, onSave, onDelete }: { entry: Entry | null; onClose: () => void; onSave: (entry: Entry, name: string, calories: number) => void; onDelete: (entry: Entry) => void }) {
  const styles = useAppStyles();
  const [name, setName] = useState(''); const [calories, setCalories] = useState('');
  useEffect(() => { setName(entry?.name ?? ''); setCalories(entry ? String(entry.calories) : ''); }, [entry]);
  if (!entry) return null;
  const contents = <><Text style={styles.title}>Edit entry</Text><Field label="Name" value={name} onChangeText={setName} /><Field label="Calories" value={calories} onChangeText={setCalories} keyboardType="numeric" /><Button label="Save changes" onPress={() => { const amount = Number(calories); if (name.trim() && amount > 0) { onSave(entry, name.trim(), Math.round(amount)); onClose(); } }} /><Button quiet destructive label="Delete entry" onPress={() => { onClose(); onDelete(entry); }} /></>;
  if (Platform.OS === 'ios') return <Modal visible animationType="slide" presentationStyle="pageSheet" allowSwipeDismissal onRequestClose={onClose}><KeyboardAvoidingView behavior="padding" style={styles.nativeEditRoot}><SafeAreaView style={styles.nativeEditSafeArea}><ScrollView contentContainerStyle={styles.nativeEditSheet} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{contents}</ScrollView></SafeAreaView></KeyboardAvoidingView></Modal>;
  return <Modal visible transparent animationType="slide" onRequestClose={onClose}><View style={styles.modalBackdrop}><Pressable style={StyleSheet.absoluteFill} onPress={onClose} /><KeyboardAvoidingView behavior="height" style={styles.androidEditAvoider}><View style={styles.editSheet}>{contents}</View></KeyboardAvoidingView></View></Modal>;
}

export function useAppStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background }, loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  onboarding: { flex: 1, justifyContent: 'space-between', padding: spacing.lg, backgroundColor: colors.background }, brand: { color: colors.accent, fontSize: 17, fontWeight: '700', letterSpacing: 0.2 }, onboardTitle: { marginTop: 24, color: colors.ink, fontSize: 36, fontWeight: '700', letterSpacing: -1 }, onboardCopy: { marginTop: 12, color: colors.muted, fontSize: 17, lineHeight: 24, maxWidth: 260 }, onboardBottom: { gap: 24, paddingBottom: 24 },
  page: { flex: 1, paddingHorizontal: spacing.md, paddingTop: 28, paddingBottom: 94 }, today: { color: colors.muted, fontSize: 16, fontWeight: '600', textAlign: 'center' }, balance: { alignItems: 'center', paddingTop: 14, paddingBottom: 26 }, balanceRing: { width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }, ringCanvas: { position: 'absolute' }, balanceContent: { alignItems: 'center', justifyContent: 'center' }, balanceLine: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: 7 }, balanceNumber: { fontSize: 66, lineHeight: 72, fontWeight: '700', letterSpacing: -3.2 }, balanceWord: { fontSize: 24, lineHeight: 32, fontWeight: '600', letterSpacing: -0.8 }, targetText: { marginTop: 9, color: colors.muted, fontSize: 14, textAlign: 'center' }, listHeader: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, addIconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.ink, shadowColor: '#000', shadowOpacity: 0.13, shadowOffset: { width: 0, height: 3 }, shadowRadius: 6, elevation: 3 }, iconPressed: { opacity: 0.62 }, plusFallback: { color: colors.surface, fontSize: 25, lineHeight: 27 },
  list: { marginTop: 12 }, entry: { minHeight: 66, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.line }, entryName: { color: colors.ink, fontSize: 17, fontWeight: '500' }, entryTime: { marginTop: 4, color: colors.muted, fontSize: 13 }, entryCalories: { color: colors.ink, fontSize: 17, fontVariant: ['tabular-nums'] }, empty: { paddingTop: 18, color: colors.muted, fontSize: 16 },
  pageTitle: { color: colors.ink, fontSize: 34, fontWeight: '700', letterSpacing: -1 }, pageCopy: { marginTop: 8, color: colors.muted, fontSize: 16, lineHeight: 22 }, historyList: { marginTop: 34, gap: 22 }, historyRow: { gap: 0 }, historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 }, historyDate: { color: colors.ink, fontSize: 16, fontWeight: '600' }, historyCalories: { color: colors.muted, fontSize: 14, fontVariant: ['tabular-nums'] }, barTrack: { height: 5, borderRadius: 3, overflow: 'hidden', backgroundColor: colors.line }, bar: { height: '100%', borderRadius: 3 },
  settingsGroup: { marginTop: 36, gap: 16 }, divider: { height: 1, backgroundColor: colors.line, marginTop: 36 }, settingValue: { color: colors.ink, fontSize: 17 }, danger: { marginTop: 36, gap: 12 }, modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.22)' }, androidEditAvoider: { flex: 1, justifyContent: 'flex-end' }, editSheet: { padding: spacing.md, paddingBottom: 36, gap: 20, backgroundColor: colors.background, borderTopLeftRadius: 26, borderTopRightRadius: 26 }, nativeEditRoot: { flex: 1, backgroundColor: colors.background }, nativeEditSafeArea: { flex: 1 }, nativeEditSheet: { flexGrow: 1, padding: spacing.md, paddingBottom: 36, gap: 20 }, title: { color: colors.ink, fontSize: 26, fontWeight: '700' },
});
