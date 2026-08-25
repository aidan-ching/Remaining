import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemeColors, useTheme } from './theme';

export function Button({ label, onPress, quiet = false, destructive = false, success = false }: { label: string; onPress: () => void; quiet?: boolean; destructive?: boolean; success?: boolean }) {
  const styles = useComponentStyles();
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => { if (success) Animated.sequence([Animated.spring(scale, { toValue: 1.035, useNativeDriver: true, speed: 22, bounciness: 7 }), Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 5 })]).start(); }, [scale, success]);
  return <Animated.View style={{ transform: [{ scale }] }}><Pressable onPress={onPress} style={({ pressed }) => [styles.button, quiet && styles.quietButton, destructive && styles.destructiveButton, pressed && styles.pressed]}>
    <Text style={[styles.buttonText, quiet && styles.quietText, destructive && styles.destructiveText]}>{success ? 'Saved ✓' : label}</Text>
  </Pressable></Animated.View>;
}

export function Field({ label, value, onChangeText, keyboardType = 'default', autoFocus = false }: { label: string; value: string; onChangeText: (text: string) => void; keyboardType?: 'default' | 'numeric'; autoFocus?: boolean }) {
  const { colors } = useTheme();
  const styles = useComponentStyles();
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput autoFocus={autoFocus} value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholderTextColor={colors.muted} style={styles.input} /></View>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const styles = useComponentStyles();
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function useComponentStyles() {
  const { colors } = useTheme();
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  button: { minHeight: 52, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.ink },
  buttonText: { color: colors.surface, fontSize: 16, fontWeight: '600' },
  quietButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
  quietText: { color: colors.ink },
  destructiveButton: { borderColor: colors.destructiveLine },
  destructiveText: { color: colors.red },
  pressed: { opacity: 0.7 },
  field: { gap: 8 },
  label: { color: colors.muted, fontSize: 14 },
  input: { height: 52, borderBottomWidth: 1, borderColor: colors.line, color: colors.ink, fontSize: 20, paddingHorizontal: 0 },
  sectionTitle: { fontSize: 15, color: colors.muted, fontWeight: '600', letterSpacing: 0.2 },
});
