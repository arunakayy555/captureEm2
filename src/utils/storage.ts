import { ForFunItem, BodyWellness, UserSettings, PurchaseItem } from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_FOR_FUN,
  INITIAL_BODY,
} from './sampleData';

const KEYS = {
  SETTINGS: 'capture_em_settings_v1',
  FOR_FUN: 'capture_em_for_fun_v1',
  BODY: 'capture_em_body_v1',
  PURCHASES: 'capture_em_purchases_v1',
};

// Obsolete local keys to purge
const OBSOLETE_KEYS = [
  'capture_em_tasks_v1',
  'capture_em_projects_v1',
  'capture_em_sessions_v1',
  'capture_em_reviews_v1',
];

// Clean up obsolete mock keys from localStorage
try {
  OBSOLETE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });
} catch {}

export const storage = {
  getSettings: (): UserSettings => {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },
  saveSettings: (settings: UserSettings) => {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  },

  getForFun: (): ForFunItem[] => {
    try {
      const data = localStorage.getItem(KEYS.FOR_FUN);
      return data ? JSON.parse(data) : INITIAL_FOR_FUN;
    } catch {
      return INITIAL_FOR_FUN;
    }
  },
  saveForFun: (items: ForFunItem[]) => {
    try {
      localStorage.setItem(KEYS.FOR_FUN, JSON.stringify(items));
    } catch {}
  },

  getBody: (): BodyWellness => {
    try {
      const data = localStorage.getItem(KEYS.BODY);
      const parsed: BodyWellness = data ? JSON.parse(data) : INITIAL_BODY;
      const today = new Date().toISOString().split('T')[0];
      if (parsed.date !== today) {
        return {
          ...parsed,
          date: today,
          tasks: parsed.tasks.map((t) => ({ ...t, completed: false })),
        };
      }
      return parsed;
    } catch {
      return INITIAL_BODY;
    }
  },
  saveBody: (body: BodyWellness) => {
    try {
      localStorage.setItem(KEYS.BODY, JSON.stringify(body));
    } catch {}
  },

  getPurchases: (): PurchaseItem[] => {
    try {
      const data = localStorage.getItem(KEYS.PURCHASES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  savePurchases: (items: PurchaseItem[]) => {
    try {
      localStorage.setItem(KEYS.PURCHASES, JSON.stringify(items));
    } catch {}
  },
};
