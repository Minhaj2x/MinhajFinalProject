import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4qahXrROgVfsDri9idYrQ3l5NIbWU-F0",
  authDomain: "workout-generator-a56f3.firebaseapp.com",
  projectId: "workout-generator-a56f3",
  storageBucket: "workout-generator-a56f3.appspot.com",
  messagingSenderId: "1030097680505",
  appId: "1:1030097680505:web:f227c49edc634488d53ca8",
  measurementId: "G-MMCC2VP5NV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const messaging = getMessaging(app);

export { app, db, auth, messaging, getToken, onMessage };
