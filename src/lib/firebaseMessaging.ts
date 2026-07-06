import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app, firebaseConfig } from "./firebaseConfig";
import { toast } from "sonner";
import { store } from "@/store/store";
import { api } from "@/store/api";

export async function requestPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return null;

        const messaging = getMessaging(app);

        // Register Service Worker explicitly for reliability
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
        });

        const token = await getToken(messaging, {
            vapidKey: firebaseConfig.VAPIDKey,
            serviceWorkerRegistration: registration,
        });

        // Foreground messaging setup
        onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);
            if (payload.notification) {
                const title = payload.notification.title || "إشعار جديد";
                const body = payload.notification.body || "";
                toast(title, {
                    description: body,
                });

                // Invalidate notifications cache to update UI instantly
                store.dispatch(api.util.invalidateTags(["Notifications"]));
            }
        });

        return token;
    } catch (error) {
        console.error("Error in requestPermission:", error);
        return null;
    }
}