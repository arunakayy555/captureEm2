import { ForFunItem, BodyWellness, UserSettings } from '../types';

export const INITIAL_SETTINGS: UserSettings = {
  theme: 'night',
  focusDuration: 45,
  soundEnabled: true,
};

export const INITIAL_FOR_FUN: ForFunItem[] = [];

export const INITIAL_BODY: BodyWellness = {
  date: new Date().toISOString().split('T')[0],
  energy: 7,
  sleep: 'Good',
  movement: 'Planned',
  water: 'Good',
  tasks: [],
};
