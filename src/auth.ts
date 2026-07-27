export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerData: { providerId: string; displayName: string | null; email: string | null; photoURL: string | null }[];
  tenantId: string | null;
}

interface FirestoreDocRef {
  type: 'doc';
  path: string;
}

interface FirestoreCollectionRef {
  type: 'collection';
  path: string;
}

interface FirestoreQueryRef {
  type: 'query';
  path: string;
  conditions: Array<{ field: string; op: string; value: unknown }>;
  limitValue?: number;
  orderByValue?: Array<{ field: string; direction: 'asc' | 'desc' }>;
}

interface FirestoreQueryComponent {
  type: 'where' | 'limit' | 'orderBy';
  field?: string;
  op?: string;
  value?: unknown;
  limitValue?: number;
  orderByValue?: Array<{ field: string; direction: 'asc' | 'desc' }>;
}

const TOKEN_KEY = 'civicmitra:token';
const AUTH_KEY = 'civicmitra:auth';

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredAuth(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const response = await fetch(`/api${path}`, { ...options, headers });
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Request failed');
  }
  return data;
}

const authListeners = new Set<(user: AuthUser | null) => void>();

export const auth = {
  get currentUser() {
    return readStoredAuth() as AuthUser | null;
  },
  set currentUser(user: AuthUser | null) {
    writeStoredAuth(user);
    authListeners.forEach(cb => cb(user));
  },
};

export function onAuthStateChanged(_auth: unknown, callback: (user: AuthUser | null) => void) {
  callback(auth.currentUser);
  authListeners.add(callback);
  return () => authListeners.delete(callback);
}

export async function signInWithEmailAndPassword(_auth: unknown, email: string, password: string) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const user = {
    uid: data.user.uid,
    email: data.user.email,
    displayName: data.user.fullName || data.user.username,
    photoURL: data.user.avatarUrl || null,
    emailVerified: true,
    isAnonymous: false,
    providerData: [],
    tenantId: null,
  };
  auth.currentUser = user;
  localStorage.setItem(TOKEN_KEY, data.token);
  return { user };
}

export async function createUserWithEmailAndPassword(_auth: unknown, email: string, password: string) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const user = {
    uid: data.user.uid,
    email: data.user.email,
    displayName: data.user.fullName || data.user.username,
    photoURL: data.user.avatarUrl || null,
    emailVerified: true,
    isAnonymous: false,
    providerData: [],
    tenantId: null,
  };
  auth.currentUser = user;
  localStorage.setItem(TOKEN_KEY, data.token);
  return { user };
}

export async function signOut(_auth: unknown) {
  auth.currentUser = null;
  localStorage.removeItem(TOKEN_KEY);
}

export const db = {};
export const storage = {};

export function collection(_db: unknown, path: string): FirestoreCollectionRef {
  return { type: 'collection', path };
}

export function doc(_db: unknown, path: string, id?: string): FirestoreDocRef {
  if (id !== undefined) {
    return { type: 'doc', path: `${path}/${id}` };
  }
  return { type: 'doc', path };
}

export function where(field: string, op: string, value: unknown): FirestoreQueryComponent {
  return { type: 'where', field, op, value };
}

export function limit(limitValue: number): FirestoreQueryComponent {
  return { type: 'limit', limitValue };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): FirestoreQueryComponent {
  return { type: 'orderBy', orderByValue: [{ field, direction }] };
}

export function query(...components: Array<FirestoreCollectionRef | FirestoreQueryComponent>) {
  const collectionRef = components.find((item): item is FirestoreCollectionRef => item.type === 'collection');
  const conditions = components.filter((item): item is FirestoreQueryComponent => item.type === 'where').map((item) => ({ field: item.field!, op: item.op!, value: item.value }));
  const limitValue = components.find((item): item is FirestoreQueryComponent => item.type === 'limit')?.limitValue;
  const orderByValue = components.flatMap((item): Array<{ field: string; direction: 'asc' | 'desc' }> => item.type === 'orderBy' ? item.orderByValue || [] : []);
  return { type: 'query', path: collectionRef?.path || '', conditions, limitValue, orderByValue } as FirestoreQueryRef;
}

async function fetchCollection(path: string, queryRef?: FirestoreQueryRef) {
  const params = new URLSearchParams();
  if (queryRef?.conditions) {
    for (const condition of queryRef.conditions) {
      params.set(condition.field, String(condition.value));
    }
  }
  if (queryRef?.limitValue) {
    params.set('_limit', String(queryRef.limitValue));
  }
  if (queryRef?.orderByValue?.length) {
    const order = queryRef.orderByValue[0];
    params.set('_sort', order.field);
    params.set('_direction', order.direction);
  }
  const suffix = params.toString() ? `?${params.toString()}` : '';
  const data = await apiRequest(`/${path}${suffix}`);
  return Array.isArray(data) ? data : [];
}

function createDocSnapshot(data: unknown, exists: boolean) {
  return {
    exists: () => exists,
    data: () => data,
  };
}

function createCollectionSnapshot(rows: any[]) {
  return {
    docs: rows.map((row: any, index: number) => ({
      id: row._id || row.id || `${index}`,
      data: () => row,
    })),
    empty: rows.length === 0,
    size: rows.length,
  };
}

export async function getDoc(ref: FirestoreDocRef) {
  try {
    const data = await apiRequest(`/${ref.path}`);
    if (!data || data.error) {
      return createDocSnapshot(undefined, false);
    }
    return createDocSnapshot(data, true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('not found') || message.includes('Not Found') || message.includes('404')) {
      return createDocSnapshot(undefined, false);
    }
    throw error;
  }
}

export async function getDocs(ref: FirestoreCollectionRef | FirestoreQueryRef) {
  const path = ref.type === 'query' ? ref.path : ref.path;
  const rows = await fetchCollection(path, ref.type === 'query' ? ref : undefined);
  return createCollectionSnapshot(rows);
}

export async function setDoc(ref: FirestoreDocRef, data: unknown) {
  await apiRequest(`/${ref.path}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function addDoc(ref: FirestoreCollectionRef, data: unknown) {
  return apiRequest(`/${ref.path}`, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateDoc(ref: FirestoreDocRef, data: unknown) {
  await apiRequest(`/${ref.path}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteDoc(ref: FirestoreDocRef) {
  await apiRequest(`/${ref.path}`, { method: 'DELETE' });
}

export function onSnapshot(ref: FirestoreCollectionRef | FirestoreDocRef | FirestoreQueryRef, callback: (snapshot: any) => void) {
  const load = async () => {
    if (ref.type === 'doc') {
      const docResult = await getDoc(ref);
      callback(docResult);
      return;
    }
    const docsResult = await getDocs(ref);
    callback(docsResult);
  };
  void load();
  return () => undefined;
}

export function writeBatch() {
  return {
    set() {},
    update() {},
    delete() {},
    commit: async () => undefined,
  };
}

export const increment = (value: number) => value;
export const getCountFromServer = async () => ({ data: () => ({ count: 0 }) });

export type User = AuthUser;

export class GoogleAuthProvider {
  providerId = 'google.com';
}

export async function signInWithPopup(_auth: unknown, _provider: GoogleAuthProvider) {
  throw new Error('Google sign-in is disabled in this build.');
}
