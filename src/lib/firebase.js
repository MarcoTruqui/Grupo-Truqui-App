import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";

export const firebaseConfig = {
  apiKey: "AIzaSyBJq8TLT3yJq-ZaOsA5KPZu61_VMnSAMTY",
  authDomain: "tch-mant-marco.firebaseapp.com",
  projectId: "tch-mant-marco",
  storageBucket: "tch-mant-marco.firebasestorage.app",
  messagingSenderId: "1019886619243",
  appId: "1:1019886619243:web:5e3d68417bea10db167f2e",
};

firebase.initializeApp(firebaseConfig);
firebase.firestore().enablePersistence({synchronizeTabs:true}).catch(e => console.log("Persistence:", e.code));

export const db = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();
