// sync.js
import { saveToIndexedDB, fetchFromIndexedDB } from "./indexDB.js";
import { saveWorkoutToFirestore, fetchWorkoutsFromFirestore } from "./firebaseDB.js";

// Sync data from IndexedDB to Firebase
export async function syncToFirebase() {
  try {
    const offlineData = await fetchFromIndexedDB();
    offlineData.forEach(async workout => {
      await saveWorkoutToFirestore(workout);
    });
    console.log("Data synced to Firebase successfully.");
  } catch (error) {
    console.error("Error syncing to Firebase:", error.message);
  }
}

// Sync data from Firebase to IndexedDB
export async function syncToIndexedDB() {
  try {
    const onlineData = await fetchWorkoutsFromFirestore();
    onlineData.forEach(async workout => {
      await saveToIndexedDB(workout);
    });
    console.log("Data synced to IndexedDB successfully.");
  } catch (error) {
    console.error("Error syncing to IndexedDB:", error.message);
  }
}

// Example Usage
// Call these functions during app initialization or when network status changes
// syncToFirebase();
// syncToIndexedDB();
