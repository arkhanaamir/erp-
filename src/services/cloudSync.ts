import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  Project,
  Worker,
  AttendanceRecord,
  DailySiteReport,
  MaterialItem,
  MaterialTransaction,
  ExpenseRecord,
  Vendor,
  QuoteEstimate,
  InteriorSelectionItem,
  SitePhotoItem,
  UserProfile
} from '../types';

export interface CasabuildCloudState {
  projects: Project[];
  workers: Worker[];
  attendance: AttendanceRecord[];
  dailyReports: DailySiteReport[];
  materials: MaterialItem[];
  transactions: MaterialTransaction[];
  expenses: ExpenseRecord[];
  vendors: Vendor[];
  quotes: QuoteEstimate[];
  selections: InteriorSelectionItem[];
  sitePhotos: SitePhotoItem[];
  users: UserProfile[];
}

/**
 * Recursively strip undefined properties from an object or array.
 * Firebase Firestore strictly rejects fields with `undefined` values.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Save a single document to Firebase Firestore cloud database
 */
export async function writeDocumentToCloud(collectionName: string, id: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    const sanitizedData = sanitizeForFirestore(data);
    await setDoc(docRef, sanitizedData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${id}`);
  }
}

/**
 * Delete a single document from Firebase Firestore
 */
export async function deleteDocumentFromCloud(collectionName: string, id: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

/**
 * Synchronize all local ERP records into Firebase Firestore in parallel
 */
export async function uploadAllToCloud(state: CasabuildCloudState): Promise<{ count: number }> {
  let totalSaved = 0;

  const saveBatch = async (collName: string, items: any[]) => {
    for (const item of items) {
      if (item && item.id) {
        const sanitizedItem = sanitizeForFirestore(item);
        await setDoc(doc(db, collName, item.id), sanitizedItem);
        totalSaved++;
      }
    }
  };

  try {
    await Promise.all([
      saveBatch('projects', state.projects),
      saveBatch('workers', state.workers),
      saveBatch('attendance', state.attendance),
      saveBatch('dailyReports', state.dailyReports),
      saveBatch('materials', state.materials),
      saveBatch('materialTransactions', state.transactions),
      saveBatch('expenses', state.expenses),
      saveBatch('vendors', state.vendors),
      saveBatch('quotes', state.quotes),
      saveBatch('interiorSelections', state.selections),
      saveBatch('sitePhotos', state.sitePhotos),
      saveBatch('users', state.users)
    ]);
    return { count: totalSaved };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_upload');
    return { count: totalSaved };
  }
}

/**
 * Subscribe to all 12 Firebase Firestore collections in real time
 */
export function subscribeToAllCollections(
  onUpdate: (data: Partial<CasabuildCloudState>) => void,
  onError: (err: any) => void
): () => void {
  const unsubs: Unsubscribe[] = [];

  const collectionsToListen: { key: keyof CasabuildCloudState; path: string }[] = [
    { key: 'projects', path: 'projects' },
    { key: 'workers', path: 'workers' },
    { key: 'attendance', path: 'attendance' },
    { key: 'dailyReports', path: 'dailyReports' },
    { key: 'materials', path: 'materials' },
    { key: 'transactions', path: 'materialTransactions' },
    { key: 'expenses', path: 'expenses' },
    { key: 'vendors', path: 'vendors' },
    { key: 'quotes', path: 'quotes' },
    { key: 'selections', path: 'interiorSelections' },
    { key: 'sitePhotos', path: 'sitePhotos' },
    { key: 'users', path: 'users' },
  ];

  collectionsToListen.forEach(({ key, path }) => {
    try {
      const unsub = onSnapshot(
        collection(db, path),
        (snapshot) => {
          if (!snapshot.empty) {
            const docsData = snapshot.docs.map(d => d.data());
            onUpdate({ [key]: docsData });
          }
        },
        (error) => {
          onError(error);
          console.debug(`Firestore real-time sync notice for ${path}:`, error.message);
        }
      );
      unsubs.push(unsub);
    } catch (error) {
      onError(error);
    }
  });

  return () => {
    unsubs.forEach(u => {
      try {
        u();
      } catch {}
    });
  };
}

/**
 * Fetch latest full snapshot from cloud
 */
export async function fetchFullCloudSnapshot(): Promise<Partial<CasabuildCloudState>> {
  const result: Partial<CasabuildCloudState> = {};

  const fetchCollection = async (path: string): Promise<any[]> => {
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => d.data());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  };

  const [
    projects,
    workers,
    attendance,
    dailyReports,
    materials,
    transactions,
    expenses,
    vendors,
    quotes,
    selections,
    sitePhotos,
    users
  ] = await Promise.all([
    fetchCollection('projects'),
    fetchCollection('workers'),
    fetchCollection('attendance'),
    fetchCollection('dailyReports'),
    fetchCollection('materials'),
    fetchCollection('materialTransactions'),
    fetchCollection('expenses'),
    fetchCollection('vendors'),
    fetchCollection('quotes'),
    fetchCollection('interiorSelections'),
    fetchCollection('sitePhotos'),
    fetchCollection('users')
  ]);

  if (projects.length) result.projects = projects;
  if (workers.length) result.workers = workers;
  if (attendance.length) result.attendance = attendance;
  if (dailyReports.length) result.dailyReports = dailyReports;
  if (materials.length) result.materials = materials;
  if (transactions.length) result.transactions = transactions;
  if (expenses.length) result.expenses = expenses;
  if (vendors.length) result.vendors = vendors;
  if (quotes.length) result.quotes = quotes;
  if (selections.length) result.selections = selections;
  if (sitePhotos.length) result.sitePhotos = sitePhotos;
  if (users.length) result.users = users;

  return result;
}
