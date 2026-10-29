import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/app-text';

export function Home() {
  return (
    <View testID="home-screen" className="flex-1 items-center justify-center bg-background">
      {__DEV__ ? (
        <Link href="/dev/tokens" asChild>
          <Pressable accessibilityRole="button" className="rounded-lg bg-primary-soft px-6 py-3">
            <AppText variant="body-sm" weight="bold" tone="primary">
              Design tokens
            </AppText>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
}
