import type { ActiveSession, Session, Solve } from '../types';

const DATABASE_NAME = 'droobtimer';
const DATABASE_VERSION = 2;
const ACTIVE_SESSION_KEY = 'droobtimer-active-session';

const SESSIONS_STORE = 'sessions';
const SOLVES_STORE = 'solves';

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = event => {
      const database = request.result;
      const transaction = request.transaction;

      if (!database.objectStoreNames.contains(SESSIONS_STORE)) {
        database.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(SOLVES_STORE)) {
        const solvesStore = database.createObjectStore(SOLVES_STORE, { keyPath: 'id' });
        solvesStore.createIndex('sessionId', 'sessionId');
      }

      // Version 1 only contained temporary seeded test sessions.
      if (event.oldVersion === 1 && transaction) {
        transaction.objectStore(SESSIONS_STORE).clear();
        transaction.objectStore(SOLVES_STORE).clear();
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getSessions(): Promise<Session[]> {
  const database = await openDatabase();
  const transaction = database.transaction(SESSIONS_STORE, 'readonly');
  const sessions = await requestToPromise(transaction.objectStore(SESSIONS_STORE).getAll());

  return sessions as Session[];
}

export async function getSolves(sessionId: number): Promise<Solve[]> {
  const database = await openDatabase();
  const transaction = database.transaction(SOLVES_STORE, 'readonly');
  const index = transaction.objectStore(SOLVES_STORE).index('sessionId');
  const solves = (await requestToPromise(index.getAll(sessionId))) as Solve[];

  return solves.sort((a, b) => b.createdAt - a.createdAt);
}

export async function getActiveSession(sessionId: number): Promise<ActiveSession | null> {
  const database = await openDatabase();
  const transaction = database.transaction(SESSIONS_STORE, 'readonly');
  const session = (await requestToPromise(
    transaction.objectStore(SESSIONS_STORE).get(sessionId)
  )) as Session | undefined;

  if (!session) {
    return null;
  }

  return {
    ...session,
    solves: await getSolves(session.id),
  };
}

export async function saveSession(session: Session): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(SESSIONS_STORE, 'readwrite');
  transaction.objectStore(SESSIONS_STORE).put(session);
  await transactionToPromise(transaction);
}

export async function syncSolves(sessionId: number, solves: Solve[]): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(SOLVES_STORE, 'readwrite');
  const store = transaction.objectStore(SOLVES_STORE);
  const index = store.index('sessionId');
  const existingKeys = (await requestToPromise(index.getAllKeys(sessionId))) as IDBValidKey[];
  const solveIds = new Set(solves.map(solve => solve.id));

  existingKeys.forEach(key => {
    if (typeof key === 'number' && !solveIds.has(key)) {
      store.delete(key);
    }
  });

  solves.forEach(solve => store.put(solve));

  await transactionToPromise(transaction);
}

export function getSavedActiveSessionId(): number | null {
  const value = localStorage.getItem(ACTIVE_SESSION_KEY);
  const sessionId = value === null ? NaN : Number(value);

  return Number.isFinite(sessionId) ? sessionId : null;
}

export function saveActiveSessionId(sessionId: number) {
  localStorage.setItem(ACTIVE_SESSION_KEY, String(sessionId));
}

export async function deleteSession(sessionId: number): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction([SESSIONS_STORE, SOLVES_STORE], 'readwrite');

  const sessionsStore = transaction.objectStore(SESSIONS_STORE);
  const solvesStore = transaction.objectStore(SOLVES_STORE);
  const solvesIndex = solvesStore.index('sessionId');

  const solveKeys = await requestToPromise(solvesIndex.getAllKeys(sessionId));

  solveKeys.forEach(key => {
    solvesStore.delete(key);
  });

  sessionsStore.delete(sessionId);

  await transactionToPromise(transaction);
}
