import { app } from './app';
import { features } from './features';
import { motion } from './motion';
import { navigation } from './navigation';

/**
 * Every tunable constant in the app. Change values in the files of this folder,
 * never inline in code (ARCHITECTURE.md §9.2).
 */
export const config = Object.freeze({ app, features, motion, navigation });

export type Config = typeof config;
export type { CodeLanguage } from './app';
