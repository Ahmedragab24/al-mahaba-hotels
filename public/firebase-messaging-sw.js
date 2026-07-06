importScripts(
    "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyCg6rm_KdsiMRTdJFNpfJsGeou5PjE_5i8",
    authDomain: "hotels-d07ff.firebaseapp.com",
    projectId: "hotels-d07ff",
    storageBucket: "hotels-d07ff.firebasestorage.app",
    messagingSenderId: "377150174941",
    appId: "1:377150174941:web:82e44e2a7b49c853f58d34",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    self.registration.showNotification(
        payload.notification.title,
        {
            body: payload.notification.body,
            icon: "/logo.png",
        }
    );
});