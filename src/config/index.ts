import { app } from './app';
import { features } from './features';

/**
 * Every tunable constant in the app. Change values in the files of this folder,
 * never inline in code (ARCHITECTURE.md §9.2).
 */
export const config = Object.freeze({ app, features });

export type Config = typeof config;
export type { CodeLanguage } from './app';
