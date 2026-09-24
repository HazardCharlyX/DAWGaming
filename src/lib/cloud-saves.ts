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
  storagePath?: string;
  downloadUrl?: string;
}

/**
 * Convierte un Uint8Array a Base64 de forma eficiente y segura contra stack overflow
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 0x8000; // 32KB por bloque
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary);
}

/**
 * Convierte un string Base64 a Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Sube el archivo de guardado a Cloud Firestore (Base de Datos) bajo users/{userId}/saves/{gameId}
 * y opcionalmente a Firebase Storage como respaldo.
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

  const nowIso = new Date().toISOString();
  const base64Data = uint8ArrayToBase64(saveBytes);

  // 1. Guardar DIRECTAMENTE en la base de datos Firestore (asociado al UID del usuario)
  const saveDocRef = doc(db, 'users', userId, 'saves', gameId);
  const docData: any = {
    gameId,
    gameTitle,
    platform,
    fileName: cleanFileName,
    fileSizeBytes: saveBytes.byteLength,
    lastSavedAt: nowIso,
    userId: userId,
    saveDataBase64: base64Data, // El archivo .sav/.srm guardado en base de datos
    updatedAtServer: serverTimestamp(),
  };

  await setDoc(saveDocRef, docData, { merge: true });
  console.log(`[DAWGAMING Cloud] Partida de "${gameTitle}" guardada con éxito en Firestore DB para ${userId}`);

  // 2. Subir también a Firebase Storage como respaldo dual
  let downloadUrl: string | undefined;
  let storagePath: string = `users/${userId}/saves/${cleanFileName}`;
  try {
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, saveBytes, {
      contentType: 'application/octet-stream',
      customMetadata: {
        gameId,
        platform,
        gameTitle,
        userId,
      },
    });

    downloadUrl = await getDownloadURL(storageRef).catch(() => undefined);
    if (downloadUrl) {
      await setDoc(saveDocRef, { storagePath, downloadUrl }, { merge: true });
    }
  } catch (storageErr) {
    console.warn('[DAWGAMING Cloud] Guardado en Firestore DB exitoso (Storage respaldo opcional omitido):', storageErr);
  }

  return {
    gameId,
    gameTitle,
    platform,
    fileName: cleanFileName,
    fileSizeBytes: saveBytes.byteLength,
    lastSavedAt: nowIso,
    storagePath,
    downloadUrl,
  };
}

/**
 * Descarga el archivo de partida de Firestore DB o Firebase Storage como Uint8Array
 */
export async function downloadCloudSave(
  userId: string,
  gameId: string,
  fileName?: string
): Promise<Uint8Array | null> {
  try {
    // 1. Prioridad: Recuperar directamente de la base de datos Firestore (más rápido y directo)
    const docRef = doc(db, 'users', userId, 'saves', gameId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.saveDataBase64 && typeof data.saveDataBase64 === 'string') {
        console.log(`[DAWGAMING Cloud] Partida de "${gameId}" recuperada desde Firestore DB`);
        return base64ToUint8Array(data.saveDataBase64);
      }
    }

    // 2. Si no estaba el Base64 en Firestore, buscar en Firebase Storage
    const cleanFileName = fileName || `${gameId}.srm`;
    const storagePath = `users/${userId}/saves/${cleanFileName}`;
    const storageRef = ref(storage, storagePath);
    const arrayBuffer = await getBytes(storageRef);
    console.log(`[DAWGAMING Cloud] Partida de "${gameId}" recuperada desde Firebase Storage`);
    return new Uint8Array(arrayBuffer);
  } catch (error: any) {
    if (error?.code === 'storage/object-not-found') {
      return null;
    }
    console.warn('[DAWGAMING Cloud] Error o partida no encontrada:', error);
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
      const data = snap.data();
      return {
        gameId: data.gameId || gameId,
        gameTitle: data.gameTitle || '',
        platform: data.platform || 'nds',
        fileName: data.fileName || `${gameId}.srm`,
        fileSizeBytes: data.fileSizeBytes || 0,
        lastSavedAt: data.lastSavedAt || new Date().toISOString(),
        storagePath: data.storagePath,
        downloadUrl: data.downloadUrl,
      };
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
    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        gameId: data.gameId || d.id,
        gameTitle: data.gameTitle || '',
        platform: data.platform || 'nds',
        fileName: data.fileName || `${d.id}.srm`,
        fileSizeBytes: data.fileSizeBytes || 0,
        lastSavedAt: data.lastSavedAt || new Date().toISOString(),
        storagePath: data.storagePath,
        downloadUrl: data.downloadUrl,
      };
    });
  } catch (e) {
    console.error('Error getting user cloud saves:', e);
    return [];
  }
}

/**
 * Elimina una partida guardada en la nube (Firestore y Storage)
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
    console.log(`[DAWGAMING Cloud] Partida eliminada de la nube: ${gameId}`);
  } catch (e) {
    console.error('Error deleting cloud save:', e);
  }
}
