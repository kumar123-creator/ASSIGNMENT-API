// src/firebase.js
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB3LWRNk1j-5h_w2iDIx_JTT-g0mFAb7aA",
    authDomain: "assignment-api-fda6f.firebaseapp.com",
    projectId: "assignment-api-fda6f",
    storageBucket: "assignment-api-fda6f.appspot.com",
    messagingSenderId: "430596039192",
    appId: "1:430596039192:web:58af904901e50df226996d"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();
