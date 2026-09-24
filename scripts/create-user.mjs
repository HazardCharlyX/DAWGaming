import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC-Pd1k9rVM3SZervGYqdcxEiKn5XTmNBM",
  authDomain: "dawgaming-376c4.firebaseapp.com",
  projectId: "dawgaming-376c4",
  storageBucket: "dawgaming-376c4.firebasestorage.app",
  messagingSenderId: "301207513471",
  appId: "1:301207513471:web:f7147740bb4035f280d24a",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const username = process.argv[2]?.trim();
const password = process.argv[3]?.trim();

if (!username || !password) {
  console.log('\n❌ Uso incorrecto.');
  console.log('Forma de uso: node scripts/create-user.mjs <usuario> <contraseña>');
  console.log('Ejemplo:      node scripts/create-user.mjs carlos 123456\n');
  process.exit(1);
}

if (password.length < 6) {
  console.log('\n❌ La contraseña debe tener al menos 6 caracteres.\n');
  process.exit(1);
}

async function run() {
  const cleanUsername = username.toLowerCase();
  const email = `${cleanUsername}@dawgaming.app`;

  try {
    console.log(`\n⏳ Registrando usuario "${username}" en Firebase Authentication...`);
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(cred.user, {
      displayName: username,
    });

    console.log(`✅ Usuario creado en Firebase Authentication.`);

    // Intentar sincronizar en Firestore con un timeout corto
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('FIRESTORE_TIMEOUT')), 4000)
      );

      const firestorePromise = setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        username: cleanUsername,
        displayName: username,
        email: email,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });

      await Promise.race([firestorePromise, timeoutPromise]);
      console.log(`✅ Perfil registrado en Firestore Database.`);
    } catch (dbErr) {
      console.log(`\n⚠️  AVISO DE FIRESTORE DATABASE:`);
      console.log(`El usuario se creó correctamente en Authentication, pero tu base de datos Firestore aún no está activada en Firebase Console.`);
      console.log(`Para activar el guardado en la nube:`);
      console.log(`1. Entra en: https://console.firebase.google.com/project/dawgaming-376c4/firestore`);
      console.log(`2. Haz clic en "Crear base de datos" en modo de prueba.`);
    }

    console.log(`\n===============================================`);
    console.log(`👤 Usuario listo:     ${username}`);
    console.log(`🔑 Contraseña:        ${password}`);
    console.log(`📧 Email generado:    ${email}`);
    console.log(`🆔 Firebase UID:      ${cred.user.uid}`);
    console.log(`===============================================`);
    console.log(`El usuario ya puede iniciar sesión en la web escribiendo:`);
    console.log(`Usuario: ${username} | Contraseña: ${password}\n`);
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`\n⚠️  El usuario "${username}" ya existe en Firebase.`);
      console.log(`Ya puede iniciar sesión en la web con ese usuario.`);
      console.log(`Si olvidó su contraseña, puedes gestionarlo desde la pestaña Authentication en:`);
      console.log(`https://console.firebase.google.com/project/dawgaming-376c4/authentication/users\n`);
    } else {
      console.error('\n❌ Error al crear usuario en Firebase:', error.message, '\n');
    }
    process.exit(1);
  }
}

run();
