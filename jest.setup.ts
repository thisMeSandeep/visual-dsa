// Reanimated and Worklets load a native module on import, which Jest doesn't have.

jest.mock('react-native-worklets', () => require('react-native-worklets/src/mock'));

// Reanimated 4.7's official mock (`react-native-reanimated/mock`) imports the real package, whose
// native initializer calls a CSS API that the Jest fallback throws on. So we mock only the
// Reanimated APIs the app uses, and add to this list as new ones are used.
jest.mock('react-native-reanimated', () => {
  const { Image, ScrollView, Text, View } = require('react-native');
  const Animated = {
    View,
    Text,
    Image,
    ScrollView,
    createAnimatedComponent: <T>(component: T) => component,
  };
  return {
    __esModule: true,
    default: Animated,
    ...Animated,
    cubicBezier: () => 'cubic-bezier',
    useReducedMotion: () => false,
  };
});
