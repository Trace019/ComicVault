// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-analytics.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.5.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBE78nMP9WzB6kJ_bQ5KTwe5rsATmMCw_4",
  authDomain: "snackato-cde4b.firebaseapp.com",
  projectId: "snackato-cde4b",
  storageBucket: "snackato-cde4b.firebasestorage.app",
  messagingSenderId: "860864907466",
  appId: "1:860864907466:web:726cecd04cb504d03c0c33",
  measurementId: "G-1P9QRKJ0SX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);



// Authentication state observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        try {
            // Get user document from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                // Update UI elements if they exist on the page
                const userDisplay = document.getElementById("userDisplay");
                const phoneDisplay = document.getElementById("phoneDisplay");
                const addressDisplay = document.getElementById("addressDisplay");
                const emailDisplay = document.getElementById("emailDisplay");
                const passwordDisplay = document.getElementById("passwordDisplay");
                const creationDisplay = document.getElementById("creationDisplay");
                
                if (userDisplay) {
                    userDisplay.textContent = userData.username || user.email.split('@')[0];
                }
                if (phoneDisplay) {
                    phoneDisplay.textContent = userData.phone || "Not provided";
                }
                if (addressDisplay) {
                    addressDisplay.textContent = userData.address || "Not provided";
                }
                if (emailDisplay) {
                    emailDisplay.textContent = user.email;
                }
                if (passwordDisplay) {
                    passwordDisplay.textContent = user.password || "********"; // Mask password
                }
                if (creationDisplay) {
                    const creationDate = new Date(userData.createdAt.seconds * 1000);
                    creationDisplay.textContent = creationDate.toLocaleDateString();
                }
            }
        } catch (error) {
            console.error("Error Displaying User Data:", error);
        }
    } else {
        // User is signed out
        if (window.location.pathname.includes("options.html")) {
            window.location.href = "index.html";
        }
    }
});

const logoutButton = document.getElementById('logout');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    // Clear Local Storage Items
    localStorage.removeItem('lastOrderInfo');
    localStorage.removeItem('cart');
    
    // Signed Out From Firebase
    auth.signOut()
      .then(() => {
        console.log('User Has Now Signed Out.');
        window.location.href = 'index.html';
      })
      .catch((error) => {
        console.error("Failed to Log Out...");
      });
  });
}
