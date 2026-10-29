import { StyleSheet, View } from 'react-native';

export function Home() {
  return <View testID="home-screen" style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
