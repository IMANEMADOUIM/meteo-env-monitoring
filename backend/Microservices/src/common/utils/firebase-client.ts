import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

const auth = getAuth();

// Fonction pour envoyer le lien de vérification par email
export const sendEmailVerificationLink = async (email: string) => {
  const actionCodeSettings = {
    url: "http://localhost:5173/auth/verify-email", // Mettre l'URL correcte pour la vérification
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem("emailForSignIn", email); // Sauvegarde l'email pour le retrouver plus tard
};

// Fonction pour vérifier le lien de vérification
export const verifyEmailLink = async (email: string, currentUrl: string) => {
  if (isSignInWithEmailLink(auth, currentUrl)) {
    await signInWithEmailLink(auth, email, currentUrl);
    window.localStorage.removeItem("emailForSignIn"); // Supprime l'email après la connexion
  } else {
    throw new Error("Lien invalide ou expiré");
  }
};
