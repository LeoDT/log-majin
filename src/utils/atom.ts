import type {
  IDBPDatabase,
  DBSchema,
  StoreNames,
  StoreValue,
  StoreKey,
} from 'idb';
import type { AsyncStorage } from 'jotai/vanilla/utils/atomWithStorage';

export function createIDBStorageForAtom<
  DBType extends DBSchema,
  K extends StoreNames<DBType>,
  V extends StoreValue<DBType, K>,
>(db: IDBPDatabase<DBType>, storeName: K): AsyncStorage<V> {
  return {
    async getItem(k: string, initial: V) {
      const result = await db.get(storeName, k as StoreKey<DBType, K>);

      return result ?? initial;
    },
    async setItem(_k: string, v: V) {
      await db.put(storeName, v);
    },
    async removeItem(k: string) {
      await db.delete(storeName, k as StoreKey<DBType, K>);
    },
  };
}
