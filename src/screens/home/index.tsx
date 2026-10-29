import { Link } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppText } from '@/components/app-text';
import { Button } from '@/components/button';

/** Learn tab. The real home (topic list, Continue card) arrives in Step 2.3. */
export function Home() {
  return (
    <ScrollView
      testID="home-screen"
      className="flex-1 bg-background"
      contentContainerClassName="gap-7 px-6 pt-safe-offset-4 pb-6"
    >
      <View className="gap-2">
        <AppText variant="display" accessibilityRole="header">
          Learn
        </AppText>
        <AppText variant="body-sm">Topics and the Continue card arrive in Step 2.3.</AppText>
      </View>

      <View className="gap-3">
        <Link href={{ pathname: '/topic/[topicId]', params: { topicId: 'hash-table' } }} asChild>
          <Button label="Open a topic" icon="learn" />
        </Link>
        {__DEV__ ? (
          <>
            <Link href="/dev/tokens" asChild>
              <Button label="Design tokens" variant="tinted" />
            </Link>
            <Link href="/dev/components" asChild>
              <Button label="Components" variant="tinted" />
            </Link>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}
