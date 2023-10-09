// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
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
  const querySnapshot = await getDocs(collection(db, "assignments"));
  const assignments = [];
  querySnapshot.forEach((doc) => {
    assignments.push({ id: doc.id, ...doc.data() });
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

