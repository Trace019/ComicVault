// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmfq3xW59vn2GCWsG-gpVRMspN-v9gNfk",
  authDomain: "comicvault-99ba3.firebaseapp.com",
  projectId: "comicvault-99ba3",
  storageBucket: "comicvault-99ba3.firebasestorage.app",
  messagingSenderId: "1022239750280",
  appId: "1:1022239750280:web:e63df9c52978b5344b873d",
  measurementId: "G-FQFRVL2EW4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);