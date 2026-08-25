import { Alert, SafeAreaView, Text } from 'react-native';
import { Settings, useAppStyles } from '../App';
import { useRemainingData } from '../src/useRemainingData';

export default function SettingsRoute() {
  const styles = useAppStyles();
  const { data, update, reset } = useRemainingData();
  if (!data) return <SafeAreaView style={styles.loading}><Text style={styles.brand}>Remaining</Text></SafeAreaView>;
  const clear = () => Alert.alert('Clear all data?', 'This deletes every saved entry and your target.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear data', style: 'destructive', onPress: () => { void reset(); } }]);
  return <SafeAreaView style={styles.app}><Settings target={data.target || 2000} onTarget={(target) => update({ ...data, target })} onClear={clear} /></SafeAreaView>;
}
