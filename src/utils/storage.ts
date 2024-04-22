import { openDB, type DBSchema } from 'idb';

import { Log } from '../atoms/log';
import { Template, TemplateRevision } from '../atoms/template';

const DB_NAME = 'log-majin-db';
const DB_VERSION = 1;

export const KEYRANGE_MIN = 0;
export const KEYRANGE_MAX = [];

interface DB extends DBSchema {
  template: {
    key: string;
    value: Template;
  };
  templateRevision: {
    key: string;
    value: TemplateRevision;
    indexes: { 'by-create-template': [string, Date] };
  };
  log: {
    key: string;
    value: Log;
    indexes: {
      'by-create': Date;
      'by-create-content-template': [string, string, Date];
    };
  };
  inputHistory: {
    key: string;
    value: {
      slotId: string;
      history: Array<string>;
    };
  };
}

export function ensureDB() {
  return openDB<DB>(DB_NAME, DB_VERSION, {
    async upgrade(db) {
      db.createObjectStore('template', {
        keyPath: 'id',
      });

      const revisionStore = db.createObjectStore('templateRevision', {
        keyPath: 'id',
      });

      revisionStore.createIndex('by-create-template', [
        'createAt',
        'templateId',
      ]);

      const logStore = db.createObjectStore('log', {
        keyPath: 'id',
      });

      logStore.createIndex('by-create-content-template', [
        'templateId',
        'content',
        'createAt',
      ]);
      logStore.createIndex('by-create', 'createAt');

      db.createObjectStore('inputHistory', {
        keyPath: 'slotId',
      });
    },
  });
}

export const db = await ensureDB();

window.db = db;
