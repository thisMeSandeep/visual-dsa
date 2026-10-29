import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export function Home() {
  return (
    <View testID="home-screen" className="flex-1 items-center justify-center bg-background">
      {__DEV__ ? (
        <Link href="/dev/tokens" asChild>
          <Pressable accessibilityRole="button" className="rounded-lg bg-primary-soft px-6 py-3">
            <Text className="text-primary font-bold">Design tokens</Text>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}
