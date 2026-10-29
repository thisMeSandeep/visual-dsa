/**
 * Every icon the app uses, by meaning. App code asks for `<Icon name="chapters" />`, never for a
 * Phosphor component, so swapping an icon (or the whole library) happens in this one file.
 *
 * Each icon is imported from its own file: importing from the package root would bundle all
 * 1,442 Phosphor icons.
 */
import { ArrowCounterClockwiseIcon } from 'phosphor-react-native/src/icons/ArrowCounterClockwise';
import { ArrowUUpLeftIcon } from 'phosphor-react-native/src/icons/ArrowUUpLeft';
import { BookmarkSimpleIcon } from 'phosphor-react-native/src/icons/BookmarkSimple';
import { BookOpenIcon } from 'phosphor-react-native/src/icons/BookOpen';
import { CaretLeftIcon } from 'phosphor-react-native/src/icons/CaretLeft';
import { CaretRightIcon } from 'phosphor-react-native/src/icons/CaretRight';
import { ChartLineUpIcon } from 'phosphor-react-native/src/icons/ChartLineUp';
import { CheckIcon } from 'phosphor-react-native/src/icons/Check';
import { CodeIcon } from 'phosphor-react-native/src/icons/Code';
import { CopyIcon } from 'phosphor-react-native/src/icons/Copy';
import { FlameIcon } from 'phosphor-react-native/src/icons/Flame';
import { GearIcon } from 'phosphor-react-native/src/icons/Gear';
import { GraduationCapIcon } from 'phosphor-react-native/src/icons/GraduationCap';
import { LightbulbIcon } from 'phosphor-react-native/src/icons/Lightbulb';
import { ListNumbersIcon } from 'phosphor-react-native/src/icons/ListNumbers';
import { PauseIcon } from 'phosphor-react-native/src/icons/Pause';
import { PlayIcon } from 'phosphor-react-native/src/icons/Play';
import { ShuffleIcon } from 'phosphor-react-native/src/icons/Shuffle';
import { XIcon } from 'phosphor-react-native/src/icons/X';

/* VISUAL-SPEC §5 */
export const ICONS = {
  // Navigation
  close: XIcon,
  back: CaretLeftIcon,
  // Lesson player
  'step-back': CaretLeftIcon,
  'step-forward': CaretRightIcon,
  play: PlayIcon,
  pause: PauseIcon,
  chapters: ListNumbersIcon,
  code: CodeIcon,
  copy: CopyIcon,
  reference: BookOpenIcon,
  // Sandbox
  reset: ArrowCounterClockwiseIcon,
  undo: ArrowUUpLeftIcon,
  random: ShuffleIcon,
  // Tabs
  learn: BookOpenIcon,
  practice: GraduationCapIcon,
  progress: ChartLineUpIcon,
  settings: GearIcon,
  // Status
  bookmark: BookmarkSimpleIcon,
  streak: FlameIcon,
  done: CheckIcon,
  incorrect: XIcon,
  predict: LightbulbIcon,
} as const;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];
