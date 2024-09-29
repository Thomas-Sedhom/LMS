// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAnalytics, isSupported } from "firebase/analytics";
import * as process from 'node:process';

const firebaseConfig = {
  apiKey: "AIzaSyBJjUXNBYNyUupLRTTXHYbIWu8lgcwHhHA",
  authDomain: "lms0-cfac8.firebaseapp.com",
  projectId: "lms0-cfac8",
  storageBucket: "lms0-cfac8.appspot.com",
  messagingSenderId: "396769491243",
  appId: "1:396769491243:web:63d808f9b37c70dedbad6e",
  measurementId: "G-1PPZ4M3T2D",
};
export const app = initializeApp(firebaseConfig);
if (isSupported()) {
  if (typeof window !== "undefined") {
    initializeAnalytics(app);
  }
}