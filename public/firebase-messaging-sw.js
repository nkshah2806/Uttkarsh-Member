// // public/firebase-messaging-sw.js
// self.importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
// self.importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// firebase.initializeApp({
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_PROJECT_ID.appspot.com",
//   messagingSenderId: "YOUR_SENDER_ID",
//   appId: "YOUR_APP_ID"
// });

// const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function(payload) {
//   console.log("[firebase-messaging-sw.js] Received background message ", payload);
//   const { title, body } = payload.notification;
//   const notificationOptions = {
//     body,
//     icon: "/logo.png" // optional
//   };

//   self.registration.showNotification(title, notificationOptions);
// });
