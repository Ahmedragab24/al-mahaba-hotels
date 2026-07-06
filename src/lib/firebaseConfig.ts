// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyCg6rm_KdsiMRTdJFNpfJsGeou5PjE_5i8",
    authDomain: "hotels-d07ff.firebaseapp.com",
    projectId: "hotels-d07ff",
    storageBucket: "hotels-d07ff.firebasestorage.app",
    messagingSenderId: "377150174941",
    appId: "1:377150174941:web:82e44e2a7b49c853f58d34",
    VAPIDKey: "BOTfBLet2Qjh6pRjovF2k8tIBlGh7yEswNLcDtOj3LXe42l1GWCPoipsN1vZ47RffyrV5vCYogixSecJYyOzHuQ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);