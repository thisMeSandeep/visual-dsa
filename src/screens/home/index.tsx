import { Link } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/button';

export function Home() {
  return (
    <View testID="home-screen" className="flex-1 justify-center gap-3 bg-background px-6">
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
  );
}
