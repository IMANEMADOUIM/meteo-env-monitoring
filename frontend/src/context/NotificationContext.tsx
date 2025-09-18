import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Notification {
  _id: string;
  type: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  hasUnread: boolean;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  hasUnread: false,
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = io("http://localhost:5000", {
      auth: { token },
    });

    socket.on("notification", (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, hasUnread: notifications.some((n) => !n.isRead) }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
