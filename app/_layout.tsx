import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { ThemeProvider, useTheme } from '../src/theme';
import { RemainingDataProvider } from '../src/useRemainingData';

export default function Layout() {
  return <ThemeProvider><RemainingDataProvider><Tabs /></RemainingDataProvider></ThemeProvider>;
}

function Tabs() {
  const { colors } = useTheme();
  return <NativeTabs iconColor={{ default: colors.muted, selected: colors.ink }} tintColor={colors.ink} minimizeBehavior="never">
    <NativeTabs.Trigger name="index"><Icon sf={{ default: 'house', selected: 'house.fill' }} /><Label>Home</Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="history"><Icon sf="clock.arrow.circlepath" /><Label>History</Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="settings"><Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} /><Label>Settings</Label></NativeTabs.Trigger>
  </NativeTabs>;
}
