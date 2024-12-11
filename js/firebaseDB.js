import { db } from "./firebaseConfig.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function saveWorkoutToFirestore(workout) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const docRef = doc(db, `workouts/${user.uid}/${workout.id}`);
  await setDoc(docRef, workout);
  console.log("Workout saved to Firestore!");
}

export async function fetchWorkoutsFromFirestore() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const workoutCollection = collection(db, `workouts/${user.uid}`);
  const snapshot = await getDocs(workoutCollection);
  return snapshot.docs.map(doc => doc.data());
}
