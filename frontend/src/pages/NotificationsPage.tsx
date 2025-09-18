import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

interface Notification {
  _id: string;
  type: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const socket = io("http://localhost:5000", {
  auth: { token: localStorage.getItem("token") },
});

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    socket.on("notification", (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off("notification");
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Erreur API", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch("http://localhost:5000/api/notifications/read-all", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Erreur API", err);
    }
  };

  return (
    <div>
      <h1>🔔 Notifications en temps réel</h1>
      <button onClick={markAllAsRead} className="bg-blue-500 text-white px-3 py-1 rounded">
        Tout marquer comme lu
      </button>
      <ul>
        {notifications.map((n) => (
          <li key={n._id} className={n.isRead ? "opacity-50" : ""}>
            <b>{n.type}</b> - {n.message} ({new Date(n.timestamp).toLocaleTimeString()})
            {!n.isRead && (
              <button
                onClick={() => markAsRead(n._id)}
                className="ml-2 text-sm text-green-600 underline"
              >
                Marquer comme lu
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
