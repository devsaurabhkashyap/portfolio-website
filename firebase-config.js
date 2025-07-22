// firebase-config.js - Firebase Configuration
// Replace these values with your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAIYNTvwpv8b7MugJcPXuAka4On472AIIk",
    authDomain: "portfolio-website-afcbd.firebaseapp.com",
    projectId: "portfolio-website-afcbd",
    storageBucket: "portfolio-website-afcbd.firebasestorage.app",
    messagingSenderId: "193679463181",
    appId: "1:193679463181:web:6b51682fc769bafb04d644"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.auth = auth;
window.db = db;