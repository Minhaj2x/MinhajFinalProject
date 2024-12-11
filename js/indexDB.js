import { openDB } from "https://cdnjs.cloudflare.com/ajax/libs/idb/7.0.0/idb.min.js";

export async function saveToIndexedDB(workout) {
  const db = await openDB("workout-app", 1, {
    upgrade(db) {
      db.createObjectStore("workouts", { keyPath: "id" });
    },
  });
  await db.put("workouts", workout);
  console.log("Workout saved to IndexedDB");
}

export async function fetchFromIndexedDB() {
  const db = await openDB("workout-app", 1);
  return db.getAll("workouts");
}
