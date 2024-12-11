import { openDB } from "https://unpkg.com/idb?module";
import {
  addWorkoutToFirebase,
  getWorkoutsFromFirebase,
  deleteWorkoutFromFirebase,
  updateWorkoutInFirebase,
} from "./firebaseDB.js";
import { messaging } from "./firebaseConfig.js";

// --- Constants ---
const STORAGE_THRESHOLD = 0.8;
let serviceWorkerRegistration = null;

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Materialize components
  M.Sidenav.init(document.querySelectorAll(".sidenav"));

  // Check storage and request persistent storage
  checkStorageUsage();
  requestPersistentStorage();

  // Enable notifications if applicable
  const notificationButton = document.getElementById("enable-notifications-btn");
  if (notificationButton) {
    notificationButton.addEventListener("click", initNotificationPermission);
  }
});

// Register Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
      serviceWorkerRegistration = registration;
      console.log("Service Worker Registered!", registration);
    })
    .catch((err) => console.error("Service Worker registration failed", err));
}

// --- IndexedDB Operations ---
let dbPromise;

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("workoutManager", 1, {
      upgrade(db) {
        const store = db.createObjectStore("workouts", {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("category", "category");
        store.createIndex("synced", "synced");
      },
    });
  }
  return dbPromise;
}

// --- Sync Functions ---
export async function syncWorkouts() {
  const db = await getDB();
  const tx = db.transaction("workouts", "readonly");
  const store = tx.objectStore("workouts");
  const workouts = await store.getAll();

  for (const workout of workouts) {
    if (!workout.synced && isOnline()) {
      try {
        const savedWorkout = await addWorkoutToFirebase(workout);
        const txUpdate = db.transaction("workouts", "readwrite");
        const storeUpdate = txUpdate.objectStore("workouts");
        await storeUpdate.delete(workout.id);
        await storeUpdate.put({ ...workout, id: savedWorkout.id, synced: true });
        await txUpdate.done;
      } catch (error) {
        console.error("Error syncing workout:", error);
      }
    }
  }
}

// --- Storage Management ---
function checkStorageUsage() {
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(({ usage, quota }) => {
      const usagePercentage = (usage / quota) * 100;
      console.log(`Storage usage: ${usagePercentage.toFixed(2)}%`);
      if (usagePercentage > STORAGE_THRESHOLD * 100) {
        console.warn("Storage usage is near the threshold. Consider cleaning up data.");
      }
    });
  }
}

function requestPersistentStorage() {
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().then((granted) => {
      if (granted) {
        console.log("Persistent storage granted.");
      } else {
        console.warn("Persistent storage not granted.");
      }
    });
  }
}

// --- Workout Management ---
export async function loadWorkouts() {
  const db = await getDB();
  const workoutContainer = document.querySelector(".workouts");
  workoutContainer.innerHTML = "";

  if (isOnline()) {
    const firebaseWorkouts = await getWorkoutsFromFirebase();
    const tx = db.transaction("workouts", "readwrite");
    const store = tx.objectStore("workouts");

    for (const workout of firebaseWorkouts) {
      await store.put({ ...workout, synced: true });
      displayWorkout(workout);
    }
    await tx.done;
  } else {
    const tx = db.transaction("workouts", "readonly");
    const store = tx.objectStore("workouts");
    const workouts = await store.getAll();
    workouts.forEach(displayWorkout);
    await tx.done;
  }
}

function displayWorkout(workout) {
  const workoutContainer = document.querySelector(".workouts");
  const existingWorkout = workoutContainer.querySelector(`[data-id="${workout.id}"]`);

  if (existingWorkout) {
    existingWorkout.remove();
  }

  const html = `
    <div class="card-panel white row valign-wrapper" data-id="${workout.id}">
      <div class="col s2">
        <img src="/img/icons/workout.png" class="circle responsive-img" alt="Workout icon" />
      </div>
      <div class="workout-detail col s8">
        <h5 class="workout-title black-text">${workout.name}</h5>
        <p class="workout-description">${workout.description}</p>
        <p class="workout-category">${workout.category}</p>
        <p class="workout-duration">${workout.duration} minutes</p>
      </div>
      <div class="col s2 right-align">
        <button class="workout-delete btn-flat">
          <i class="material-icons black-text">delete</i>
        </button>
        <button class="workout-edit btn-flat">
          <i class="material-icons black-text">edit</i>
        </button>
      </div>
    </div>
  `;
  workoutContainer.insertAdjacentHTML("beforeend", html);

  const deleteButton = workoutContainer.querySelector(`[data-id="${workout.id}"] .workout-delete`);
  deleteButton.addEventListener("click", () => deleteWorkout(workout.id));

  const editButton = workoutContainer.querySelector(`[data-id="${workout.id}"] .workout-edit`);
  editButton.addEventListener("click", () => editWorkout(workout.id, workout));
}

export async function deleteWorkout(id) {
  const db = await getDB();
  if (isOnline()) {
    try {
      await deleteWorkoutFromFirebase(id);
    } catch (error) {
      console.error("Error deleting workout from Firebase:", error);
    }
  }

  const tx = db.transaction("workouts", "readwrite");
  const store = tx.objectStore("workouts");
  await store.delete(id);
  await tx.done;

  const workoutCard = document.querySelector(`[data-id="${id}"]`);
  if (workoutCard) {
    workoutCard.remove();
  }
  checkStorageUsage();
}

// --- Online Check ---
function isOnline() {
  return navigator.onLine;
}
