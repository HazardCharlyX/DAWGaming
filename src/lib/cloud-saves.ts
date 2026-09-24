import { db, storage } from '@/lib/firebase';
import {
  ref,
  uploadBytes,
  getBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

export interface CloudSaveMetadata {
  gameId: string;
  gameTitle: string;
  platform: 'nds' | 'gba';
  fileName: string; // e.g. "pokemon_renegade_platinum.srm"
  fileSizeBytes: number;
  lastSavedAt: string;
  storagePath: string;
  downloadUrl?: string;
}

/**
 * Sube un archivo de guardado binario (.sav / .srm) a Firebase Storage
 * y registra los metadatos en Cloud Firestore bajo el usuario actual.
 */
export async function uploadCloudSave(
  userId: string,
  gameId: string,
  platform: 'nds' | 'gba',
  gameTitle: string,
  fileName: string,
  saveBytes: Uint8Array
): Promise<CloudSaveMetadata> {
  const cleanFileName = fileName.endsWith('.srm') || fileName.endsWith('.sav')
    ? fileName
    : `${fileName}.srm`;

  const storagePath = `users/${userId}/saves/${cleanFileName}`;
  const storageRef = ref(storage, storagePath);

  // 1. Subir binario a Firebase Storage
  await uploadBytes(storageRef, saveBytes, {
    contentType: 'application/octet-stream',
    customMetadata: {
      gameId,
      platform,
      gameTitle,
    },
  });

  const downloadUrl = await getDownloadURL(storageRef).catch(() => undefined);
  const nowIso = new Date().toISOString();

  const metadata: CloudSaveMetadata = {
    gameId,
    gameTitle,
    platform,
    fileName: cleanFileName,
    fileSizeBytes: saveBytes.byteLength,
    lastSavedAt: nowIso,
    storagePath,
    downloadUrl,
  };

  // 2. Guardar metadatos en Firestore: users/{userId}/saves/{gameId}
  const saveDocRef = doc(db, 'users', userId, 'saves', gameId);
  await setDoc(
    saveDocRef,
    {
      ...metadata,
      updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );

  return metadata;
}

/**
 * Descarga el archivo de partida de Firebase Storage como Uint8Array
 */
export async function downloadCloudSave(
  userId: string,
  fileName: string
): Promise<Uint8Array | null> {
  try {
    const cleanFileName = fileName.endsWith('.srm') || fileName.endsWith('.sav')
      ? fileName
      : `${fileName}.srm`;

    const storagePath = `users/${userId}/saves/${cleanFileName}`;
    const storageRef = ref(storage, storagePath);
    const arrayBuffer = await getBytes(storageRef);
    return new Uint8Array(arrayBuffer);
  } catch (error: any) {
    if (error.code === 'storage/object-not-found') {
      return null;
    }
    console.error('Error downloading cloud save:', error);
    return null;
  }
}

/**
 * Obtiene los metadatos de la partida en la nube para un juego específico
 */
export async function getCloudSaveMetadata(
  userId: string,
  gameId: string
): Promise<CloudSaveMetadata | null> {
  try {
    const docRef = doc(db, 'users', userId, 'saves', gameId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as CloudSaveMetadata;
    }
    return null;
  } catch (e) {
    console.error('Error fetching cloud save metadata:', e);
    return null;
  }
}

/**
 * Obtiene la lista de todas las partidas guardadas en la nube del usuario
 */
export async function getUserCloudSaves(userId: string): Promise<CloudSaveMetadata[]> {
  try {
    const savesRef = collection(db, 'users', userId, 'saves');
    const q = query(savesRef, orderBy('lastSavedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as CloudSaveMetadata);
  } catch (e) {
    console.error('Error getting user cloud saves:', e);
    return [];
  }
}

/**
 * Elimina una partida guardada en la nube
 */
export async function deleteCloudSave(
  userId: string,
  gameId: string,
  fileName: string
): Promise<void> {
  try {
    const storagePath = `users/${userId}/saves/${fileName}`;
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef).catch(() => {});
    await deleteDoc(doc(db, 'users', userId, 'saves', gameId));
  } catch (e) {
    console.error('Error deleting cloud save:', e);
  }
}
