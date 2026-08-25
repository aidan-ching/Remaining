import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { SymbolView } from 'expo-symbols';
import { Button, Field } from './components';
import { lookupBarcodeNutrition } from './openFoodFacts';
import { spacing, ThemeColors, useTheme } from './theme';

type Props = { visible: boolean; onClose: () => void; onSave: (name: string, calories: number) => void };

export function AddSheet({ visible, onClose, onSave }: Props) {
  const { colors } = useTheme();
  const styles = useAddSheetStyles(colors);
  const [mode, setMode] = useState<'add' | 'scan'>('add');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [servings, setServings] = useState(1);
  const [saved, setSaved] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const lastBarcode = useRef<string | null>(null);
  const lookupInFlight = useRef(false);

  const close = () => { setMode('add'); setName(''); setCalories(''); setServings(1); setSaved(false); setIsLookingUp(false); setScanMessage(null); lastBarcode.current = null; lookupInFlight.current = false; onClose(); };
  const save = () => {
    const amount = Number(calories) * (mode === 'scan' ? servings : 1);
    if (!name.trim() || !Number.isFinite(amount) || amount <= 0) return Alert.alert('Add an item', 'Enter a name and a calorie amount.');
    onSave(name.trim(), Math.round(amount)); setSaved(true); setTimeout(close, 380);
  };
  const openBarcodeScanner = () => {
    lastBarcode.current = null;
    lookupInFlight.current = false;
    setIsLookingUp(false);
    setScanMessage(null);
    setMode('scan');
  };
  const scanBarcode = async ({ data }: BarcodeScanningResult) => {
    if (lookupInFlight.current || data === lastBarcode.current) return;
    lookupInFlight.current = true;
    lastBarcode.current = data;
    setIsLookingUp(true); setScanMessage('Looking up product…');
    try {
      const product = await lookupBarcodeNutrition(data);
      if (!product) {
        setScanMessage('No product found for that barcode. Try another one, or add it manually.');
        return;
      }
      setName(product.name ?? '');
      setCalories(product.caloriesPerServing ? String(Math.round(product.caloriesPerServing)) : '');
      const details = [product.servingSize, product.servingsPerContainer ? `${product.servingsPerContainer} servings per container` : undefined].filter(Boolean).join(' · ');
      setScanMessage(product.caloriesPerServing
        ? `Filled ${Math.round(product.caloriesPerServing)} calories per serving${details ? ` · ${details}` : ''}.`
        : `Product found${details ? ` · ${details}` : ''}, but calories weren’t available. Enter them below.`);
    } catch {
      setScanMessage('Couldn’t look up that barcode. Check your connection and try again.');
    } finally { lookupInFlight.current = false; setIsLookingUp(false); }
  };

  const contents = <>
    <View style={styles.heading}><Text style={styles.title}>{mode === 'add' ? 'Add calories' : 'Scan barcode'}</Text><Pressable onPress={close}><Text style={styles.cancel}>Cancel</Text></Pressable></View>
    {mode === 'add' ? <>
      <View style={styles.fields}><Field label="What did you have?" value={name} onChangeText={setName} autoFocus /><Field label="Calories" value={calories} onChangeText={setCalories} keyboardType="numeric" /></View>
      <Button label="Save" success={saved} onPress={saved ? () => {} : save} />
      <Pressable accessibilityRole="button" accessibilityLabel="Scan barcode" style={styles.scanLink} onPress={openBarcodeScanner}><SymbolView name="camera.fill" size={16} weight="semibold" tintColor={colors.accent} fallback={<Text style={styles.scanIconFallback}>◉</Text>} /><Text style={styles.scanText}>Scan barcode</Text></Pressable>
    </> : <>
      <Text style={styles.helper}>Align a packaged-food barcode inside the frame. The camera stays ready for another barcode after each lookup.</Text>
      {permission?.granted ? <View style={styles.cameraFrame}><CameraView style={styles.camera} facing="back" autofocus="on" onBarcodeScanned={scanBarcode} barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }} /><View pointerEvents="none" style={styles.cameraOverlay}><View style={styles.scanGuide} />{isLookingUp && <View style={styles.lookupPill}><ActivityIndicator size="small" color={colors.surface} /><Text style={styles.lookupText}>Looking up</Text></View>}</View></View> : <Pressable style={styles.cameraFallback} onPress={requestPermission}><Text style={styles.cameraText}>Enable camera</Text><Text style={styles.cameraSubtext}>You can also add the product manually.</Text></Pressable>}
      {scanMessage && <Text style={styles.scanResult}>{scanMessage}</Text>}
      <View style={styles.fields}>
        <Field label="Item name" value={name} onChangeText={setName} />
        <Field label="Calories per serving" value={calories} onChangeText={setCalories} keyboardType="numeric" />
        <View style={styles.servingRow}>
          <Text style={styles.servingLabel}>Servings consumed</Text>
          <View style={styles.stepper}>
            <Pressable accessibilityRole="button" accessibilityLabel="Remove one serving" disabled={servings <= 1} onPress={() => setServings((value) => Math.max(1, value - 1))} style={({ pressed }) => [styles.stepperButton, servings <= 1 && styles.stepperButtonDisabled, pressed && styles.stepperButtonPressed]}>
              <SymbolView name="minus" size={17} weight="semibold" tintColor={colors.ink} fallback={<Text style={styles.stepperFallback}>−</Text>} />
            </Pressable>
            <Text style={styles.servingValue}>{servings}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Add one serving" onPress={() => setServings((value) => value + 1)} style={({ pressed }) => [styles.stepperButton, pressed && styles.stepperButtonPressed]}>
              <SymbolView name="plus" size={17} weight="semibold" tintColor={colors.ink} fallback={<Text style={styles.stepperFallback}>+</Text>} />
            </Pressable>
          </View>
        </View>
      </View>
      <Button label="Confirm and save" success={saved} onPress={saved ? () => {} : save} />
    </>}
  </>;

  if (Platform.OS === 'ios') return <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" allowSwipeDismissal onRequestClose={close}><KeyboardAvoidingView behavior="padding" style={styles.nativeRoot}><SafeAreaView style={styles.nativeSafeArea}><ScrollView contentContainerStyle={styles.nativeSheet} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>{contents}</ScrollView></SafeAreaView></KeyboardAvoidingView></Modal>;

  return <Modal visible={visible} animationType="slide" transparent onRequestClose={close}><View style={styles.backdrop}><Pressable style={StyleSheet.absoluteFill} onPress={close} /><KeyboardAvoidingView style={styles.androidKeyboardAvoider} behavior="height"><View style={styles.sheet}><View style={styles.handle} />{contents}</View></KeyboardAvoidingView></View></Modal>;
}

function useAddSheetStyles(colors: ThemeColors) {
  return useMemo(() => makeStyles(colors), [colors]);
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.22)' },
  nativeRoot: { flex: 1, backgroundColor: colors.background }, nativeSafeArea: { flex: 1 }, nativeSheet: { flexGrow: 1, padding: spacing.md, paddingBottom: 36, gap: spacing.md },
  androidKeyboardAvoider: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '92%', padding: spacing.md, paddingBottom: 36, gap: spacing.md, backgroundColor: colors.background, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  handle: { width: 36, height: 4, alignSelf: 'center', borderRadius: 2, backgroundColor: colors.line },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 26, color: colors.ink, fontWeight: '700' }, cancel: { color: colors.muted, fontSize: 16 },
  fields: { gap: 16 }, helper: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  scanLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 8 }, scanText: { color: colors.accent, fontWeight: '600', fontSize: 15 }, scanIconFallback: { color: colors.accent, fontSize: 15 },
  cameraFrame: { height: 190, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.ink },
  camera: { flex: 1 }, cameraOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  scanGuide: { width: '75%', height: '48%', borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)', borderRadius: 12 },
  lookupPill: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.62)' }, lookupText: { color: colors.surface, fontSize: 13, fontWeight: '600' },
  scanResult: { marginTop: -8, color: colors.muted, fontSize: 13, lineHeight: 18 },
  servingRow: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line },
  servingLabel: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  stepperButtonDisabled: { opacity: 0.35 }, stepperButtonPressed: { opacity: 0.62 },
  servingValue: { minWidth: 18, textAlign: 'center', color: colors.ink, fontSize: 17, fontWeight: '600', fontVariant: ['tabular-nums'] },
  stepperFallback: { color: colors.ink, fontSize: 20, fontWeight: '600', lineHeight: 20 },
  cameraFallback: { height: 110, borderRadius: 14, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', gap: 6 },
  cameraText: { color: colors.ink, fontSize: 16, fontWeight: '600' }, cameraSubtext: { color: colors.muted, fontSize: 13 },
});
