import { app } from './app';
import { code } from './code';
import { engine } from './engine';
import { features } from './features';
import { motion } from './motion';
import { navigation } from './navigation';
import { player } from './player';
import { storage } from './storage';
import { structures } from './structures';

/**
 * Every tunable constant in the app. Change values in the files of this folder,
 * never inline in code (ARCHITECTURE.md §9.2).
 */
export const config = Object.freeze({
  app,
  code,
  engine,
  features,
  motion,
  navigation,
  player,
  storage,
  structures,
});

export type Config = typeof config;
export type { CodeLanguage } from './app';
