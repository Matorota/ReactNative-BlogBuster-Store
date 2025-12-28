// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZK88n-QOsq3viGzmIwIOVjXfn4Jp_-lE",
  authDomain: "gameshopclientserver.firebaseapp.com",
  projectId: "gameshopclientserver",
  storageBucket: "gameshopclientserver.firebasestorage.app",
  messagingSenderId: "1009527895664",
  appId: "1:1009527895664:web:171b86d3235e2908cb26b5",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const db = getFirestore(app);
