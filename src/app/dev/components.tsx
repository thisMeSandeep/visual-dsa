import { Redirect } from 'expo-router';

import { DevComponents } from '@/screens/dev/components';

/** Development-only component showcase. Production builds redirect home. */
export default function DevComponentsRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <DevComponents />;
}
