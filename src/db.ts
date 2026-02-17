import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Bookmark, Collection } from './types';

interface SnapVaultDB extends DBSchema {
  bookmarks: {
    key: string;
    value: Bookmark;
    indexes: { 'by-collection': string; 'by-url': string };
  };
  collections: {
    key: string;
    value: Collection;
    indexes: { 'by-order': number };
  };
}

const DB_NAME = 'snapvault';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<SnapVaultDB>>;

export function initDB() {
  if (!dbPromise) {
    dbPromise = openDB<SnapVaultDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
        bookmarkStore.createIndex('by-collection', 'collectionId');
        bookmarkStore.createIndex('by-url', 'url');
        
        const collectionStore = db.createObjectStore('collections', { keyPath: 'id' });
        collectionStore.createIndex('by-order', 'order');
      },
    });
  }
  return dbPromise;
}

export async function getAllBookmarks(): Promise<Bookmark[]> {
  const db = await initDB();
  return db.getAll('bookmarks');
}

export async function getBookmarksByCollection(collectionId: string): Promise<Bookmark[]> {
  const db = await initDB();
  return db.getAllFromIndex('bookmarks', 'by-collection', collectionId);
}

export async function addBookmark(bookmark: Bookmark): Promise<void> {
  const db = await initDB();
  await db.put('bookmarks', bookmark);
}

export async function updateBookmark(bookmark: Bookmark): Promise<void> {
  const db = await initDB();
  await db.put('bookmarks', bookmark);
}

export async function deleteBookmark(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('bookmarks', id);
}

export async function getAllCollections(): Promise<Collection[]> {
  const db = await initDB();
  const collections = await db.getAll('collections');
  return collections.sort((a, b) => a.order - b.order);
}

export async function addCollection(collection: Collection): Promise<void> {
  const db = await initDB();
  await db.put('collections', collection);
}

export async function updateCollection(collection: Collection): Promise<void> {
  const db = await initDB();
  await db.put('collections', collection);
}

export async function deleteCollection(id: string): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(['bookmarks', 'collections'], 'readwrite');
  
  const bookmarks = await tx.objectStore('bookmarks').index('by-collection').getAllKeys(id);
  for (const key of bookmarks) {
    await tx.objectStore('bookmarks').delete(key);
  }
  
  await tx.objectStore('collections').delete(id);
  await tx.done;
}

export async function exportData(): Promise<string> {
  const bookmarks = await getAllBookmarks();
  const collections = await getAllCollections();
  return JSON.stringify({ bookmarks, collections }, null, 2);
}

export async function importData(jsonData: string): Promise<void> {
  const data = JSON.parse(jsonData);
  const db = await initDB();
  
  const tx = db.transaction(['bookmarks', 'collections'], 'readwrite');
  
  for (const collection of data.collections || []) {
    await tx.objectStore('collections').put(collection);
  }
  
  for (const bookmark of data.bookmarks || []) {
    await tx.objectStore('bookmarks').put(bookmark);
  }
  
  await tx.done;
}
