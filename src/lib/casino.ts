import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';

export interface CasinoShiny {
  id: string;
  name: string;
  pokedexNo: number;
  types: string[];
  level: number;
  price: number;
  spriteUrl: string;
  description: string;
}

export interface RedemptionRecord {
  id: string;
  code: string;
  uid: string;
  username: string;
  userEmail: string;
  type: 'answer' | 'shiny';
  itemId: string;
  itemTitle: string;
  cost: number;
  secretMessage?: string;
  status: 'valid' | 'redeemed_in_game';
  createdAt?: any;
}

export interface CasinoBet {
  type: 'number' | 'color' | 'parity' | 'half';
  target: number | 'red' | 'black' | 'even' | 'odd' | 'low' | 'high';
  amount: number;
}

// 27 NUMBERS ROULETTE (0 to 26: 0 is Green, 13 Red, 13 Black)
export const ROULETTE_NUMBERS = Array.from({ length: 27 }, (_, i) => i); // 0 to 26

export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25];
export const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26];

export function getNumberColor(num: number): 'green' | 'red' | 'black' {
  if (num === 0) return 'green';
  return RED_NUMBERS.includes(num) ? 'red' : 'black';
}

// Visual layout sequence on the 27-slot wheel
export const WHEEL_SEQUENCE = [
  0, 26, 3, 22, 15, 8, 19, 10, 1, 24, 13, 6, 17, 2, 25, 4, 21, 14, 7, 20, 9, 12, 5, 18, 11, 16, 23,
];

// POKÉMON SHINIES FOR POKÉMON RENEGADE PLATINUM (Prices between 500 and 15.000)
export const CASINO_SHINIES: CasinoShiny[] = [
  {
    id: 'bidoof',
    name: 'Bidoof Shiny ("Dios Bidoof")',
    pokedexNo: 399,
    types: ['Normal'],
    level: 50,
    price: 500,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/399.png',
    description: 'El legendario roedor dorado de Sinnoh con habilidad Simple / Impulso para sweepiar cualquier combate de Platino.',
  },
  {
    id: 'riolu',
    name: 'Riolu Shiny',
    pokedexNo: 447,
    types: ['Lucha'],
    level: 30,
    price: 1500,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/447.png',
    description: 'Cría de Lucario en tono amarillo dorado, listo para evolucionar de día con amistad máxima.',
  },
  {
    id: 'rotom',
    name: 'Rotom Shiny (Multiforma)',
    pokedexNo: 479,
    types: ['Eléctrico', 'Fantasma'],
    level: 30, // wait price 3000
    price: 3000,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/479.png',
    description: 'El travieso plasma de la Vieja Mansión en tono rosado brillante con catálogo de electrodomésticos.',
  },
  {
    id: 'lucario',
    name: 'Lucario Shiny',
    pokedexNo: 448,
    types: ['Lucha', 'Acero'],
    level: 55,
    price: 5000,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/448.png',
    description: 'El guerrero áurico en versión dorada y verde esmeralda con Esfera Aural y Danza Espada.',
  },
  {
    id: 'milotic',
    name: 'Milotic Shiny',
    pokedexNo: 350,
    types: ['Agua'],
    level: 60,
    price: 7500,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/350.png',
    description: 'La serpiente marina más bella del Monte Corona con cola dorada y azul celeste, gran tanque especial.',
  },
  {
    id: 'garchomp',
    name: 'Garchomp Shiny',
    pokedexNo: 445,
    types: ['Dragón', 'Tierra'],
    level: 68,
    price: 10000,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/445.png',
    description: 'El terror indiscutible de Cintia en Platino. Con Terremoto y Garra Dragón para barrer la Liga.',
  },
  {
    id: 'darkrai',
    name: 'Darkrai Shiny',
    pokedexNo: 491,
    types: ['Siniestro'],
    level: 70,
    price: 12500,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/491.png',
    description: 'El señor de las pesadillas de Isla Lunalas en tonos púrpuras y ojos zafiro con Brecha Negra.',
  },
  {
    id: 'giratina',
    name: 'Giratina Forma Origen Shiny',
    pokedexNo: 487,
    types: ['Fantasma', 'Dragón'],
    level: 80,
    price: 15000,
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/487.png',
    description: 'El amo del Mundo Distorsión en su imponente aspecto plateado y azul flúor con Griseosfera equipada.',
  },
];

export const ANSWER_PRICE = 10000;
export const ANSWER_REVEAL_TEXT =
  'No hay atajos, si os parece caro pagar entre todos 2€ por todo el trabajo que esto conlleva no mereceis nada';

const CHIPS_STORAGE_KEY = 'dawgaming_casino_chips_v2';
export const INITIAL_CHIPS = 20;

export function generateLongVoucherCode(prefix: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const chunk = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${prefix}-${chunk()}-${chunk()}-${chunk()}-${chunk()}`;
}

export function getLocalChips(userId?: string | null): number {
  if (typeof window === 'undefined') return INITIAL_CHIPS;
  const key = userId ? `${CHIPS_STORAGE_KEY}_${userId}` : `${CHIPS_STORAGE_KEY}_guest`;
  const val = localStorage.getItem(key);
  if (val === null) {
    localStorage.setItem(key, INITIAL_CHIPS.toString());
    return INITIAL_CHIPS;
  }
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? INITIAL_CHIPS : parsed;
}

export function setLocalChips(chips: number, userId?: string | null) {
  if (typeof window === 'undefined') return;
  const key = userId ? `${CHIPS_STORAGE_KEY}_${userId}` : `${CHIPS_STORAGE_KEY}_guest`;
  localStorage.setItem(key, chips.toString());
}

/**
 * Real-time subscription to user chips from Firestore
 */
export function subscribeToUserChips(
  user: User | null,
  onChipsChange: (chips: number) => void
): () => void {
  if (!user) {
    onChipsChange(getLocalChips(null));
    return () => {};
  }

  const userRef = doc(db, 'users', user.uid);

  const unsub = onSnapshot(
    userRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (typeof data.casinoChips === 'number') {
          setLocalChips(data.casinoChips, user.uid);
          onChipsChange(data.casinoChips);
          return;
        }
      }
      // If user doc exists but doesn't have casinoChips, initialize with 20
      const local = getLocalChips(user.uid);
      try {
        await setDoc(userRef, { casinoChips: local }, { merge: true });
      } catch (err) {
        console.warn('Could not initialize casinoChips in Firestore:', err);
      }
      onChipsChange(local);
    },
    (err) => {
      console.warn('Error subscribing to casinoChips in Firestore:', err.message);
      onChipsChange(getLocalChips(user.uid));
    }
  );

  return unsub;
}

/**
 * Register Bet and Outcome in Firestore & update user balance
 */
export async function executeAndRecordSpin(
  user: User,
  bets: CasinoBet[],
  winningNumber: number
): Promise<{
  totalBet: number;
  totalPayout: number;
  netWon: number;
  newBalance: number;
}> {
  const winningColor = getNumberColor(winningNumber);
  const totalBet = bets.reduce((sum, b) => sum + b.amount, 0);

  let totalPayout = 0;

  for (const bet of bets) {
    if (bet.type === 'number') {
      if (bet.target === winningNumber) {
        // Pleno pays 26 to 1! (gives 26 * bet)
        totalPayout += bet.amount * 26;
      }
    } else if (bet.type === 'color') {
      if (bet.target === winningColor) {
        // Red / Black pays 2x (1 to 1)
        totalPayout += bet.amount * 2;
      }
    } else if (bet.type === 'parity' && winningNumber !== 0) {
      const isEven = winningNumber % 2 === 0;
      if ((bet.target === 'even' && isEven) || (bet.target === 'odd' && !isEven)) {
        totalPayout += bet.amount * 2;
      }
    } else if (bet.type === 'half' && winningNumber !== 0) {
      if ((bet.target === 'low' && winningNumber >= 1 && winningNumber <= 13) ||
          (bet.target === 'high' && winningNumber >= 14 && winningNumber <= 26)) {
        totalPayout += bet.amount * 2;
      }
    }
  }

  const netWon = totalPayout - totalBet;

  // Use Firestore transaction to verify user has enough balance and update cleanly
  const userRef = doc(db, 'users', user.uid);
  let newBalance = 0;

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    let currentChips = INITIAL_CHIPS;
    if (userDoc.exists() && typeof userDoc.data().casinoChips === 'number') {
      currentChips = userDoc.data().casinoChips;
    }

    if (currentChips < totalBet) {
      throw new Error(`Saldo insuficiente. Tienes ${currentChips} fichas y apuestas ${totalBet}.`);
    }

    newBalance = currentChips - totalBet + totalPayout;
    transaction.set(userRef, { casinoChips: newBalance }, { merge: true });

    // Record the bet in casino_bets collection
    const betLogRef = doc(collection(db, 'casino_bets'));
    transaction.set(betLogRef, {
      uid: user.uid,
      username: user.displayName || user.email?.split('@')[0] || 'Gamer',
      userEmail: user.email || '',
      winningNumber,
      winningColor,
      bets,
      totalBet,
      totalPayout,
      netWon,
      chipsBefore: currentChips,
      chipsAfter: newBalance,
      createdAt: serverTimestamp(),
    });
  });

  setLocalChips(newBalance, user.uid);
  return { totalBet, totalPayout, netWon, newBalance };
}

/**
 * Grant Emergency Loan (Faucet) if bankrupt
 */
export async function claimEmergencyLoan(user: User): Promise<number> {
  const userRef = doc(db, 'users', user.uid);
  let newBalance = 10;

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    let currentChips = 0;
    if (userDoc.exists() && typeof userDoc.data().casinoChips === 'number') {
      currentChips = userDoc.data().casinoChips;
    }

    if (currentChips >= 5) {
      throw new Error('Aún tienes fichas. El préstamo solo está disponible cuando estás casi en bancarrota.');
    }

    newBalance = currentChips + 10;
    transaction.set(userRef, { casinoChips: newBalance }, { merge: true });
  });

  setLocalChips(newBalance, user.uid);
  return newBalance;
}

/**
 * Purchase and officially register a Redemption (Shiny or Answer) in Firestore
 */
export async function purchaseCasinoReward(
  user: User,
  itemType: 'answer' | 'shiny',
  itemId: string,
  itemTitle: string,
  cost: number
): Promise<RedemptionRecord> {
  const userRef = doc(db, 'users', user.uid);
  const codePrefix = itemType === 'answer' ? 'HAZARD-ANSW' : `SHINY-${itemId.toUpperCase()}`;
  const code = generateLongVoucherCode(codePrefix);

  let newBalance = 0;
  const username = user.displayName || user.email?.split('@')[0] || 'Gamer';
  const userEmail = user.email || '';

  const secretMessage = itemType === 'answer' ? ANSWER_REVEAL_TEXT : undefined;

  const redemptionData: RedemptionRecord = {
    id: code,
    code,
    uid: user.uid,
    username,
    userEmail,
    type: itemType,
    itemId,
    itemTitle,
    cost,
    secretMessage,
    status: 'valid',
  };

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);
    let currentChips = 0;
    if (userDoc.exists() && typeof userDoc.data().casinoChips === 'number') {
      currentChips = userDoc.data().casinoChips;
    }

    if (currentChips < cost) {
      throw new Error(`Fichas insuficientes. Tienes ${currentChips} y necesitas ${cost}.`);
    }

    newBalance = currentChips - cost;
    transaction.set(userRef, { casinoChips: newBalance }, { merge: true });

    // Official global registration in casino_redemptions (verified by Carlos)
    const redemptionRef = doc(db, 'casino_redemptions', code);
    transaction.set(redemptionRef, {
      ...redemptionData,
      chipsBefore: currentChips,
      chipsAfter: newBalance,
      createdAt: serverTimestamp(),
    });

    // Also register in user's personal subcollection
    const userRedemptionRef = doc(db, 'users', user.uid, 'redemptions', code);
    transaction.set(userRedemptionRef, {
      ...redemptionData,
      createdAt: serverTimestamp(),
    });
  });

  setLocalChips(newBalance, user.uid);

  // Cache locally
  if (typeof window !== 'undefined') {
    const key = `dawgaming_casino_redemptions_${user.uid}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([redemptionData, ...existing]));
  }

  return redemptionData;
}

export function getLocalRedemptions(userId?: string | null): RedemptionRecord[] {
  if (typeof window === 'undefined') return [];
  const key = userId ? `dawgaming_casino_redemptions_${userId}` : 'dawgaming_casino_redemptions_guest';
  const val = localStorage.getItem(key);
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch {
    return [];
  }
}

