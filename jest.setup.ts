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
    css: { create: <T>(styles: T) => styles },
    // Used by Gesture Handler 3 to tell shared values from plain config values.
    isSharedValue: () => false,
    cubicBezier: () => 'cubic-bezier',
    useReducedMotion: () => false,
    // Shared values and animated styles: animations jump straight to their target in tests.
    useSharedValue: <T>(initial: T) => {
      let current = initial;
      return { get: () => current, set: (next: T) => void (current = next), value: initial };
    },
    useAnimatedStyle: <T>(build: () => T) => build(),
    withTiming: <T>(target: T) => target,
    Easing: { bezier: () => 'bezier' },
    // Layout animation builders: chainable, and inert in tests.
    ...Object.fromEntries(
      ['LinearTransition', 'FadeIn', 'FadeOut', 'SlideInRight', 'SlideOutRight'].map((name) => {
        const builder: Record<string, unknown> = {};
        for (const method of ['duration', 'easing', 'reduceMotion'])
          builder[method] = () => builder;
        return [name, builder];
      }),
    ),
  };
});

// expo-sqlite's kv-store is a native SQLite database. Tests get an in-memory one with the same
// methods the app uses; `clearSync()` resets it between tests.
jest.mock('expo-sqlite/kv-store', () => {
  const items = new Map<string, string>();
  const Storage = {
    getItemSync: (key: string) => items.get(key) ?? null,
    setItemSync: (key: string, value: string) => void items.set(key, value),
    setItem: async (key: string, value: string) => void items.set(key, value),
    removeItem: async (key: string) => void items.delete(key),
    clearSync: () => items.clear(),
  };
  return { __esModule: true, default: Storage, Storage, AsyncStorage: Storage };
});
