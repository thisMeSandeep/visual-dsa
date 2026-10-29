import { Redirect } from 'expo-router';

import { DevStack } from '@/screens/dev/stack';

/** Development-only stack renderer check. Production builds redirect home. */
export default function DevStackRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <DevStack />;
}
