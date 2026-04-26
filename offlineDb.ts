import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'AnganwadiOfflineDB';
const DB_VERSION = 1;

export interface PendingRequest {
  id?: number;
  type: 'addChild' | 'addNutrition' | 'updateProfile' | 'fullChildRecord';
  data: any;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('pendingRequests')) {
          db.createObjectStore('pendingRequests', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
};

export const offlineDb = {
  async addRequest(request: Omit<PendingRequest, 'id' | 'timestamp'>) {
    const db = await getDB();
    const fullRequest: PendingRequest = {
      ...request,
      timestamp: Date.now(),
    };
    return db.add('pendingRequests', fullRequest);
  },

  async getAllRequests() {
    const db = await getDB();
    return db.getAll('pendingRequests');
  },

  async deleteRequest(id: number) {
    const db = await getDB();
    return db.delete('pendingRequests', id);
  },

  async clearRequests() {
    const db = await getDB();
    return db.clear('pendingRequests');
  }
};
