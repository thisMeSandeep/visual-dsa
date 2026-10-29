import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useRef, useState } from 'react';
import { View, type LayoutRectangle } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { config } from '@/config';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

import { AppText } from './app-text';
import { Icon } from './icon';
import type { IconName } from './icons';
import { PressableScale } from './pressable-scale';

export type TabItem = { name: string; title: string; icon: IconName };

/**
 * Bottom padding for a tab screen's scrolling content, so its last item clears the floating bar
 * (the bar is 56 tall and sits 12 above the safe area) with room to spare.
 */
export const TAB_BAR_CLEARANCE = 'pb-safe-offset-24';

const { slideMs, slideEasing } = config.motion.tabBar;
const SLIDE = { duration: slideMs, easing: Easing.bezier(...slideEasing) };
// The tabs re-flow and the label fades on the same clock as the pill, so they move as one.
const REFLOW = LinearTransition.duration(slideMs).easing(Easing.bezier(...slideEasing));
const LABEL_IN = FadeIn.duration(slideMs);
const LABEL_OUT = FadeOut.duration(slideMs);

/**
 * The app's tab bar (VISUAL-SPEC §6 "Tab bar"): a capsule floating above the bottom edge, with a
 * hairline outline like the topic cards. The current tab is wide, with its filled icon and name;
 * the others show just their icon (named for screen readers).
 *
 * The soft cobalt pill is its own layer behind the tabs. Each tab's frame is measured with
 * onLayout, and on a switch the pill slides and resizes to the new tab on the UI thread while
 * the tabs re-flow and the label fades (expo-animation skill, tab indicator recipe). With
 * reduced motion everything snaps. Screens run full height underneath the bar, so they end with
 * TAB_BAR_CLEARANCE.
 */
export function FloatingTabBar({
  state,
  emitter,
  navigateToTab,
  tabs,
}: Pick<BottomTabBarProps, 'state' | 'emitter' | 'navigateToTab'> & { tabs: readonly TabItem[] }) {
  const reducedMotion = useReducedMotion();
  const [frames, setFrames] = useState<Record<string, LayoutRectangle>>({});
  const activeKey = state.routes[state.index]?.key;

  // The pill: absolutely positioned and childless, so animating its width is cheap and keeps
  // its rounded ends (scaleX would squash them).
  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const activeFrame = activeKey ? frames[activeKey] : undefined;
  // The first placement snaps into position; only later switches slide.
  const placed = useRef(false);
  useEffect(() => {
    if (!activeFrame) return;
    if (!placed.current || reducedMotion) {
      pillX.set(activeFrame.x);
      pillWidth.set(activeFrame.width);
      placed.current = true;
      return;
    }
    pillX.set(withTiming(activeFrame.x, SLIDE));
    pillWidth.set(withTiming(activeFrame.width, SLIDE));
  }, [activeFrame, reducedMotion, pillX, pillWidth]);
  const pillStyle = useAnimatedStyle(() => ({
    width: pillWidth.get(),
    transform: [{ translateX: pillX.get() }],
  }));

  return (
    <View pointerEvents="box-none" className="absolute inset-x-0 bottom-0 px-4 pb-safe-offset-3">
      <View
        accessibilityRole="tablist"
        className="flex-row items-center gap-1 rounded-full border-hairline border-line-strong bg-surface-raised p-1.5"
      >
        <Animated.View
          pointerEvents="none"
          style={pillStyle}
          className={`absolute top-1.5 left-0 h-11 rounded-full bg-primary-soft ${activeFrame ? '' : 'opacity-0'}`}
        />
        {state.routes.map((route, index) => {
          const tab = tabs.find((item) => item.name === route.name);
          if (!tab) return null;
          const focused = index === state.index;

          const onPress = () => {
            const event = emitter.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigateToTab(route.key);
          };

          return (
            <Animated.View
              key={route.key}
              layout={reducedMotion ? undefined : REFLOW}
              className={focused ? 'flex-1' : ''}
              onLayout={(event) => {
                const frame = event.nativeEvent.layout;
                setFrames((current) => ({ ...current, [route.key]: frame }));
              }}
            >
              <PressableScale
                accessibilityRole="tab"
                accessibilityLabel={tab.title}
                accessibilityState={{ selected: focused }}
                onPress={onPress}
                onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
                contentClassName={
                  focused
                    ? 'h-11 flex-row items-center justify-center gap-2 rounded-full px-4'
                    : 'h-11 w-14 items-center justify-center rounded-full'
                }
              >
                <Icon
                  name={tab.icon}
                  size="md"
                  weight={focused ? 'fill' : 'regular'}
                  tone={focused ? 'primary' : 'muted'}
                />
                {focused ? (
                  <Animated.View
                    entering={reducedMotion ? undefined : LABEL_IN}
                    exiting={reducedMotion ? undefined : LABEL_OUT}
                  >
                    <AppText variant="body-sm" weight="bold" tone="primary" numberOfLines={1}>
                      {tab.title}
                    </AppText>
                  </Animated.View>
                ) : null}
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}
