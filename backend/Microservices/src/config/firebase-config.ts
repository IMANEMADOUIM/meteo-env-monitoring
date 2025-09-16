import { initializeApp  as initializeClientApp} from "firebase/app";
import { getAuth as getClientAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Configuration Firebase Client SDK
const firebaseClientConfig = {
  apiKey:  process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialiser Firebase Client SDK
const  clientApp = initializeClientApp(firebaseClientConfig);
export const clientAuth = getClientAuth(clientApp);
export const messaging = getMessaging(clientApp);

// Configuration Firebase Admin SDK
const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT)
  : undefined;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const auth = admin.auth();
export const bucket = admin.storage().bucket();

// Fonction pour uploader une photo de profil
export const uploadProfilePhoto = async (
  fileBuffer: Buffer,
  userId: string,
  contentType: string = 'image/jpeg'
): Promise<string> => {
  try {
    const fileName = `profile_photos/${userId}/${uuidv4()}`;
    const file = bucket.file(fileName);

    await file.save(fileBuffer, {
      metadata: {
        contentType,
      },
    });

    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
  } catch (error) {
    console.error("Erreur lors de l'upload :", error);
    throw new Error("Impossible d'uploader la photo de profil");
  }
};

// Fonction pour supprimer une photo de profil
export const deleteProfilePhoto = async (photoUrl: string): Promise<void> => {
  try {
    const matches = photoUrl.match(/profile_photos\/.*$/);
    if (!matches) throw new Error("Format d'URL invalide");

    const filePath = matches[0];
    await bucket.file(filePath).delete();
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    throw new Error("Impossible de supprimer la photo de profil");
  }
};

// Met à jour la photo de profil dans Firebase Auth
export const updateAuthProfilePhoto = async (userId: string, photoURL: string): Promise<void> => {
  try {
    await auth.updateUser(userId, {
      photoURL
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    throw new Error("Impossible de mettre à jour la photo de profil dans Auth");
  }
};

export default {
  clientAuth,
  auth,
  messaging,
  bucket,
  uploadProfilePhoto,
  deleteProfilePhoto,
  updateAuthProfilePhoto
};
