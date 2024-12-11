import { auth } from "./firebaseConfig.js";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

export async function signIn(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("User signed in successfully!");
  } catch (error) {
    console.error("Error signing in:", error.message);
  }
}

export async function logOut() {
  try {
    await signOut(auth);
    console.log("User signed out!");
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
}

export function checkAuthState(callback) {
  onAuthStateChanged(auth, user => {
    callback(user);
  });
}
