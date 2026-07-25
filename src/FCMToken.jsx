// import React, { useEffect } from "react";
// import { getToken, onMessage, deleteToken } from "firebase/messaging";
// import { messaging } from "./firebase";
// import { toast } from "sonner";

// const vapidKey =
//   "BLyYvQ6wqr9WNcGZDXS2-DevG8pvlHDIVFbgg2Y4BUXCBiArEDuG-Y-1WIV7mzV6EhuFzGXdGfS-tBXrx5LowSg";

// export default function FCMToken() {
//   useEffect(() => {
//     const fetchFcmToken = async () => {
//       try {
//         const permission = await Notification.requestPermission();
//         if (permission !== "granted") {
//           console.warn("🔒 Notification permission not granted.");
//           return;
//         }

//         // Get the old token (if any)
//         const oldToken = await getToken(messaging, { vapidKey });

//         if (oldToken) {
//           // Explicitly delete it
//           await deleteToken(messaging);
//           console.log("♻️ Old token deleted.");
//         }

//         // Get a fresh token
//         const newToken = await getToken(messaging, { vapidKey });
//         if (newToken) {
//           console.log("✅ New FCM Token:", newToken);
//           // Send newToken to your server
//         } else {
//           console.warn("❗ No registration token available.");
//         }
//       } catch (err) {
//         console.error("❌ Error getting FCM token:", err);
//       }
//     };

//     fetchFcmToken();

//     onMessage(messaging, (payload) => {
//       debugger
//       toast.success(payload.notification.title, {
//         description: payload.notification.body,
//       });
//     });
//   }, []);

//   return <p className="hidden">🔔 Check console for FCM Token</p>;
// }
