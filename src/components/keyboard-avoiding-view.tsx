import { KeyboardAvoidingView as KeyboardControllerAvoidingView } from 'react-native-keyboard-controller';
import { withUniwind } from 'uniwind';

/**
 * Use this, with `behavior="padding"`, for every screen that has a text input, so the keyboard
 * never covers the field or its buttons. It follows the keyboard's real position on both
 * platforms; React Native's own KeyboardAvoidingView misses Android's edge-to-edge keyboard.
 * Wrapped with withUniwind so `className` works (Uniwind only maps it onto core components).
 * Needs <KeyboardProvider> at the root (src/app/_layout.tsx).
 */
export const KeyboardAvoidingView = withUniwind(KeyboardControllerAvoidingView);
