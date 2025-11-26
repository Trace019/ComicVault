// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// ------------------
// @ Notificatiom
// ------------------

function showToast(message, duration = 3000) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = "toast-message";
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 50);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

// Wait until DOM is loaded
document.addEventListener("DOMContentLoaded", () => {

  // ------------------
  // @ SIGN IN
  // ------------------

  const signupBtn = document.getElementById("signinbtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      const usernameEl = document.getElementById("username");
      const emailEl = document.getElementById("email");
      const passwordEl = document.getElementById("password");
      const confirmPasswordEl = document.getElementById("confirmPassword");

      if (!usernameEl || !emailEl || !passwordEl || !confirmPasswordEl) return;

      const username = usernameEl.value.trim();
      const email = emailEl.value.trim();
      const password = passwordEl.value;
      const confirmPassword = confirmPasswordEl.value;

      if (password !== confirmPassword) {
        showToast("Passwords do not match!");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // SSave to Firestore
        await setDoc(doc(db, "users", user.uid), {
          username,
          email,
          createdAt: new Date()
        });

        showToast(`Account created successfully! Welcome, ${username}`, 3500);
        setTimeout(() => window.location.href = "login.html", 3500);

      } catch (error) {
        console.error(error.code, error.message);
        showToast("Signup failed: " + error.message, 4000);
      }
    });
  }

  // ------------------
  // @ LOGIN
  // ------------------

  const loginBtn = document.getElementById("loginbtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async (event) => {
      event.preventDefault();

      const emailEl = document.getElementById("email");
      const passwordEl = document.getElementById("password");

      if (!emailEl || !passwordEl) return;

      const email = emailEl.value.trim();
      const password = passwordEl.value;

      if (!email || !password) {
        showToast("Please fill in both fields!");
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        let username = "User";
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          if (userData.username) username = userData.username;
          console.log("Logged-in user data:", userData);
        } else {
          console.warn("No user data found in Firestore for this UID.");
        }
        showToast(`Logged In, Welcome Back ${username}!`, 3500);
        setTimeout(() => window.location.href = "homepage.html", 3500);
      } catch (error) {
        console.error(error.code, error.message);
        showToast("Login failed: " + error.message, 4000);
      }
    });
  }
});

// ------------------
// @ Login/Logout
// ------------------
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;

  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    if (user) {
      logoutBtn.innerHTML = `<i class='bx bx-log-out'></i> Log Out`;
      logoutBtn.onclick = async (e) => {
        e.preventDefault();
        try {
          await signOut(auth);
          clearAccountInfo();
          showToast("Logged out successfully!", 2000);
          setTimeout(() => {
            window.location.href = "login.html";
          }, 2500);
        } catch (err) {
          console.error("Logout failed:", err.message);
          showToast("Logout failed: " + err.message, 3000);
        }
      };
    } else {
      logoutBtn.innerHTML = `<i class='bx bx-log-in'></i> Login / Sign Up`;
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        window.location.href = "login.html";
      };
    }
  });

  function clearAccountInfo() {
    const fields = [
      "userDisplay",
      "emailDisplay",
      "phoneDisplay",
      "addressDisplay",
      "passwordDisplay",
      "creationDisplay"
    ];
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "-";
    });
  }
});


// ------------------
// @ AutoSave / AutoFill (localStorage)
// ------------------
const autoSync = "autoSync";
function setupAutoSave() {
    const inputs = document.querySelectorAll("input[id$='-autoA']");
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            const savedData = JSON.parse(localStorage.getItem(autoSync)) || {};
            const key = input.id.replace("-autoA", "");
            savedData[key] = input.value;
            localStorage.setItem(autoSync, JSON.stringify(savedData));
        });
    });
}

function setupAutoFill(fallbackData = {}) {
    const savedData = JSON.parse(localStorage.getItem(autoSync)) || {};
    const inputs = document.querySelectorAll("input[id$='-autoA']");
    const outputs = document.querySelectorAll("input[id$='-autoB']");

    inputs.forEach(input => {
        const key = input.id.replace("-autoA", "");
        input.value = fallbackData[key] || savedData[key] || "";
    });

    outputs.forEach(input => {
        const key = input.id.replace("-autoB", "");
        input.value = fallbackData[key] || savedData[key] || "";
    });
}

// ------------------
// @ Profile / Account UI
// ------------------
async function updateProfileUI(user) {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);
    const savedData = JSON.parse(localStorage.getItem(autoSync)) || {};

    if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        document.getElementById("userDisplay").textContent = userData.username || "User";
        document.getElementById("emailDisplay").textContent = userData.email || "N/A";
        document.getElementById("phoneDisplay").textContent = userData.phone || savedData.phone || "N/A";
        document.getElementById("addressDisplay").textContent = userData.address || savedData.address || "N/A";
        document.getElementById("passwordDisplay").textContent = "********";
        document.getElementById("creationDisplay").textContent = userData.createdAt
            ? (userData.createdAt.seconds 
                ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString() 
                : new Date(userData.createdAt).toLocaleDateString())
            : "N/A";
        setupAutoFill(userData);
    } else {
        setupAutoFill();
    }
}

// ------------------
// @ DOM Ready
// ------------------
document.addEventListener("DOMContentLoaded", () => {
    setupAutoSave(); 
    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (document.getElementById("userDisplay")) {
                updateProfileUI(user);
            }
        } else {
            console.log("No user logged in.");
            if (document.getElementById("userDisplay")) {
                window.location.href = "login.html";
            }
        }
    });
});

// ------------------
// @ Checkout Page Autofill
// ------------------
function setupCheckoutAutofill() {
  const nameInput = document.getElementById("name");
  if (!nameInput) return;

  const savedData = JSON.parse(localStorage.getItem("autoSync")) || {};
  if (savedData.name) {
    nameInput.value = savedData.name;
  }
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.username) {
          nameInput.value = userData.username;
        }
      }
    }
  });
  nameInput.addEventListener("input", () => {
    const savedData = JSON.parse(localStorage.getItem("autoSync")) || {};
    savedData.name = nameInput.value;
    localStorage.setItem("autoSync", JSON.stringify(savedData));
  });
}
document.addEventListener("DOMContentLoaded", () => {
  setupCheckoutAutofill();
});

// ------------------
// @ Password Click
// ------------------
document.addEventListener("DOMContentLoaded", () => {

  // ! LOGIN INPUT
  const loginPass = document.getElementById("password");
  const loginIcon = document.getElementById("showhidePass");

  if (loginPass && loginIcon) {
    loginIcon.style.cursor = "pointer";

    loginIcon.addEventListener("click", () => {
      if (loginPass.type === "password") {
        loginPass.type = "text";
        loginIcon.classList.remove("fa-lock");
        loginIcon.classList.add("fa-unlock");
      } else {
        loginPass.type = "password";
        loginIcon.classList.remove("fa-unlock");
        loginIcon.classList.add("fa-lock");
      }
    });
  }

  // ! SIGNUP INPUT
  const signupPass = document.getElementById("password");
  const signupIcon = document.getElementById("showPass2");

  if (signupPass && signupIcon) {
    signupIcon.style.cursor = "pointer";

    signupIcon.addEventListener("click", () => {
      if (signupPass.type === "password") {
        signupPass.type = "text";
        signupIcon.classList.remove("fa-lock");
        signupIcon.classList.add("fa-unlock");
      } else {
        signupPass.type = "password";
        signupIcon.classList.remove("fa-unlock");
        signupIcon.classList.add("fa-lock");
      }
    });
  }

});
