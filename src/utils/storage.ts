import { openDB, type DBSchema } from 'idb';

import { Log } from '../atoms/log';
import { Template, TemplateRevision } from '../atoms/template';

const DB_NAME = 'log-majin-db';
const DB_VERSION = 1;

interface DB extends DBSchema {
  template: {
    key: string;
    value: Template;
  };
  templateRevision: {
    key: string;
    value: TemplateRevision;
    indexes: { 'by-template-create': [string, Date] };
  };
  log: {
    key: string;
    value: Log;
    indexes: { 'by-create': Date; 'by-template-create': [string, Date] };
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

      revisionStore.createIndex('by-template-create', [
        'templateId',
        'createAt',
      ]);

      const logStore = db.createObjectStore('log', {
        keyPath: 'id',
      });

      logStore.createIndex('by-template-create', ['templateId', 'createAt']);
      logStore.createIndex('by-create', 'createAt');
    },
  });
}

export const db = await ensureDB();
