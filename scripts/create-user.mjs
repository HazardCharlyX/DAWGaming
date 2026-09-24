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
    console.log(`\n⏳ Creando usuario "${username}" en Firebase...`);
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(cred.user, {
      displayName: username,
    });

    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      username: cleanUsername,
      displayName: username,
      email: email,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    console.log(`\n✅ ¡Usuario creado con éxito!`);
    console.log(`-----------------------------------------------`);
    console.log(`👤 Nombre de Usuario: ${username}`);
    console.log(`🔑 Contraseña:        ${password}`);
    console.log(`📧 Email interno:     ${email}`);
    console.log(`🆔 Firebase UID:      ${cred.user.uid}`);
    console.log(`-----------------------------------------------`);
    console.log(`El usuario ya puede iniciar sesión en la web escribiendo:`);
    console.log(`Usuario: ${username} | Contraseña: ${password}\n`);
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`\n⚠️  El usuario "${username}" ya existe en Firebase.\n`);
    } else {
      console.error('\n❌ Error al crear usuario en Firebase:', error.message, '\n');
    }
    process.exit(1);
  }
}

run();
