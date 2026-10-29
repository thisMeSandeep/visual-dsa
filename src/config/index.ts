import { app } from './app';
import { engine } from './engine';
import { features } from './features';
import { motion } from './motion';
import { navigation } from './navigation';
import { player } from './player';

/**
 * Every tunable constant in the app. Change values in the files of this folder,
 * never inline in code (ARCHITECTURE.md §9.2).
 */
export const config = Object.freeze({ app, engine, features, motion, navigation, player });

export type Config = typeof config;
export type { CodeLanguage } from './app';
