import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '@/lib/firebase';

export interface GlobalCountdownData {
  targetTimestamp: number;
  initialDays: number;
  isUnlocked: boolean;
  totalSpins: number;
  lastAction?: string;
  lastUser?: string;
  updatedAt?: any;
}

export interface RouletteSpinLog {
  id: string;
  username: string;
  action: string;
  deltaMs: number;
  createdAt?: any;
}

const COUNTDOWN_DOC = 'countdown';
const CONFIG_COLLECTION = 'config';
const SPINS_COLLECTION = 'roulette_spins';
const LOCAL_CACHE_KEY = 'dawgaming_synced_countdown_ts';
const DEFAULT_25_DAYS_MS = 25 * 24 * 60 * 60 * 1000;

export function subscribeToGlobalCountdown(
  onData: (data: GlobalCountdownData) => void
): () => void {
  const docRef = doc(db, CONFIG_COLLECTION, COUNTDOWN_DOC);

  const unsubscribe = onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as GlobalCountdownData;
        if (typeof window !== 'undefined' && data.targetTimestamp) {
          localStorage.setItem(LOCAL_CACHE_KEY, data.targetTimestamp.toString());
        }
        onData(data);
      } else {
        // Initialize doc if it does not exist yet
        const initialTarget = Date.now() + DEFAULT_25_DAYS_MS;
        const initialData: GlobalCountdownData = {
          targetTimestamp: initialTarget,
          initialDays: 25,
          isUnlocked: false,
          totalSpins: 0,
          lastAction: 'Inicio de cuenta atrás de 25 días',
          lastUser: 'Carlos Samper (Hazard)',
        };
        try {
          await setDoc(docRef, {
            ...initialData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch {
          // If unauthenticated during first hit, use local fallback
        }
        onData(initialData);
      }
    },
    (err) => {
      console.warn('Realtime countdown subscription warning:', err.message);
      // Fallback from cache or default
      const cached = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_CACHE_KEY) : null;
      const targetTs = cached ? parseInt(cached, 10) : Date.now() + DEFAULT_25_DAYS_MS;
      onData({
        targetTimestamp: targetTs,
        initialDays: 25,
        isUnlocked: false,
        totalSpins: 0,
      });
    }
  );

  return unsubscribe;
}

export async function applyRouletteResult(
  user: User,
  actionLabel: string,
  deltaMs: number
): Promise<{ newTarget: number }> {
  const docRef = doc(db, CONFIG_COLLECTION, COUNTDOWN_DOC);
  const snap = await getDoc(docRef);

  const username =
    user.displayName || user.email?.split('@')[0] || 'Gamer 2º DAW';

  let currentTarget = Date.now() + DEFAULT_25_DAYS_MS;

  if (snap.exists()) {
    const data = snap.data() as GlobalCountdownData;
    if (data.targetTimestamp) {
      currentTarget = data.targetTimestamp;
    }
  }

  // Calculate new target timestamp
  let newTarget = currentTarget + deltaMs;
  // Ensure it doesn't go below now unless intentionally unlocked
  if (newTarget < Date.now()) {
    newTarget = Date.now();
  }

  // Update global countdown in Firestore
  await setDoc(
    docRef,
    {
      targetTimestamp: newTarget,
      totalSpins: increment(1),
      lastAction: actionLabel,
      lastUser: username,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Log spin to history collection
  try {
    await addDoc(collection(db, SPINS_COLLECTION), {
      uid: user.uid,
      username,
      action: actionLabel,
      deltaMs,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Could not record spin log:', e);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_CACHE_KEY, newTarget.toString());
  }

  return { newTarget };
}
