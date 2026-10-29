import { Redirect } from 'expo-router';

import { DevCanvas } from '@/screens/dev/canvas';

/** Development-only canvas animation check. Production builds redirect home. */
export default function DevCanvasRoute() {
  if (!__DEV__) return <Redirect href="/" />;
  return <DevCanvas />;
}
