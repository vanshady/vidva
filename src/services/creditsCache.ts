import type { PlexMediaItem } from './plexService'

/**
 * Browser-side cache of the per-item credits that only Plex's full metadata
 * endpoint returns complete (the /all listing truncates Genre, Country, Director
 * and Role). Entries are keyed by ratingKey and trusted only while the item's
 * `updatedAt` matches, so a metadata refresh in Plex invalidates them.
 *
 * Purely an optimization: any IndexedDB failure (private window, blocked
 * storage, quota) reads as an empty cache and the dashboard fetches everything.
 */

export type Credits = Pick<PlexMediaItem, 'Genre' | 'Country' | 'Director' | 'Role'>
export interface CachedCredits extends Credits {
  updatedAt?: number
}
type Snapshot = Record<string, CachedCredits>

// Bump when the stored shape changes; old databases are simply abandoned.
const DB_NAME = 'vidva-credits-v1'
const STORE = 'snapshots'

let dbPromise: Promise<IDBDatabase> | undefined

const openDb = () => {
  dbPromise ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
    req.onblocked = () => reject(new Error('IndexedDB blocked'))
  })
  // A failed open shouldn't poison every later attempt in this tab.
  dbPromise.catch(() => { dbPromise = undefined })
  return dbPromise
}

const run = async <T>(mode: IDBTransactionMode, op: (store: IDBObjectStore) => IDBRequest<T>) => {
  const db = await openDb()
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode)
    const req = op(tx.objectStore(STORE))
    tx.oncomplete = () => resolve(req.result)
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error)
  })
}

/** One snapshot per listing (library items, or a TV library's episodes). */
export const readCredits = async (key: string): Promise<Snapshot> => {
  try {
    return ((await run('readonly', store => store.get(key))) as Snapshot | undefined) ?? {}
  } catch {
    return {}
  }
}

/** Replaces the snapshot, which also drops titles no longer in the library. */
export const writeCredits = async (key: string, snapshot: Snapshot) => {
  try {
    await run('readwrite', store => store.put(snapshot, key))
  } catch {
    // Cache write failures only cost the next visit a full fetch.
  }
}

/** Keeps only what the dashboard reads, so the cache stays a few MB at most. */
export const slimCredits = (item: PlexMediaItem): CachedCredits => ({
  updatedAt: item.updatedAt,
  Genre: item.Genre?.map(({ tag }) => ({ tag })),
  Country: item.Country?.map(({ tag }) => ({ tag })),
  Director: item.Director?.map(({ tag, thumb }) => ({ tag, thumb })),
  Role: item.Role?.map(({ tag, thumb }) => ({ tag, thumb })),
})
