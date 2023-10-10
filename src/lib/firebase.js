// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { query, where} from "firebase/firestore";
import {  collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithEmailAndPassword as signInWithEmailAndPasswordFirebase ,signOut as signOutFirebase } from "firebase/auth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3LWRNk1j-5h_w2iDIx_JTT-g0mFAb7aA",
  authDomain: "assignment-api-fda6f.firebaseapp.com",
  projectId: "assignment-api-fda6f",
  storageBucket: "assignment-api-fda6f.appspot.com",
  messagingSenderId: "430596039192",
  appId: "1:430596039192:web:58af904901e50df226996d"
};

const firebaseApp = initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(firebaseApp);
const googleAuthProvider = new GoogleAuthProvider();
const signInWithEmailAndPassword = signInWithEmailAndPasswordFirebase;
const signOut = signOutFirebase;
// Export Firebase auth for use in your Svelte component
export { auth };
export {
  
    googleAuthProvider, // Export GoogleAuthProvider
    signInWithEmailAndPassword,
    signOut
  };

export async function createAssignment(assignmentData) {
  try {
    const docRef = await addDoc(collection(db, "assignments"), assignmentData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding assignment: ", error);
    return null;
  }
}

export async function getAssignments() {
    const db = getFirestore();
    const assignmentsCollection = collection(db, "assignments");
  
    // Get the currently authenticated user's ID (assuming the user is logged in)
    const userId = user ? user.uid : null;
  
    // Create a Firestore query to fetch assignments of the current user
    const q = query(assignmentsCollection, where("createdBy", "==", userId));
  
    const querySnapshot = await getDocs(q);
    const assignments = [];
  
    querySnapshot.forEach((doc) => {
      const assignmentData = doc.data();
      assignments.push({
        id: doc.id,
        title: assignmentData.title,
        description: assignmentData.description,
      });
    });
  
    return assignments;
  }

export async function deleteAssignment(assignmentId) {
  try {
    await deleteDoc(doc(db, "assignments", assignmentId));
  } catch (error) {
    console.error("Error deleting assignment: ", error);
  }
}

export async function updateAssignment(assignmentId, updatedData) {
  try {
    await updateDoc(doc(db, "assignments", assignmentId), updatedData);
  } catch (error) {
    console.error("Error updating assignment: ", error);
  }
}


