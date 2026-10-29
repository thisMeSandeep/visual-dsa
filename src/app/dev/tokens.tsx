import { Redirect } from 'expo-router';

import { DevTokens } from '@/screens/dev/tokens';

/** Development-only design token check. Production builds redirect home. */
export default function DevTokensRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <DevTokens />;
}
