import { SafeAreaView, Text } from 'react-native';
import { History, useAppStyles } from '../App';
import { useRemainingData } from '../src/useRemainingData';

export default function HistoryRoute() {
  const styles = useAppStyles();
  const { data } = useRemainingData();
  if (!data) return <SafeAreaView style={styles.loading}><Text style={styles.brand}>Remaining</Text></SafeAreaView>;
  return <SafeAreaView style={styles.app}><History target={data.target || 2000} entries={data.entries} /></SafeAreaView>;
}
