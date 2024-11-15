import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, orderBy, limit, getDocs, onSnapshot, doc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
    authDomain: "serverless-project-439901.firebaseapp.com",
    projectId: "serverless-project-439901",
    projectNumber: "170821346146",
};
  
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc, query, where, orderBy, limit, getDocs, onSnapshot, doc, updateDoc };





// Allow only authenticated users
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /Concerns/{document=**} {
//       allow read, write: if request.auth != null; 
//     }
//   }
// }
