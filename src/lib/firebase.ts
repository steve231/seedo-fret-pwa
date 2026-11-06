import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Config web Firebase — publique par nature (restreinte par les règles de
// sécurité Firebase, pas par le secret), identique aux autres apps SEEDO
// sur ce même projet (seedo-5b79d).
const firebaseConfig = {
  apiKey: "AIzaSyBsdGloQsRNklMSSrKeAKjpCZsCBcnKnZY",
  authDomain: "seedo-5b79d.firebaseapp.com",
  projectId: "seedo-5b79d",
  storageBucket: "seedo-5b79d.firebasestorage.app",
  messagingSenderId: "436102134976",
  appId: "1:436102134976:web:bf419fac8a785379c3c125",
  measurementId: "G-6QX75V474W",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
