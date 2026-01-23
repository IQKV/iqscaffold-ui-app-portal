import { notifications } from "@mantine/notifications";

/**
 * Notification service for consistent notification handling
 */
export const notificationService = {
  showSuccess: (message: string, title?: string) => {
    notifications.show({
      title: title || "Success",
      message,
      color: "green",
    });
  },

  showError: (message: string, title?: string) => {
    notifications.show({
      title: title || "Error",
      message,
      color: "red",
    });
  },

  showWarning: (message: string, title?: string) => {
    notifications.show({
      title: title || "Warning",
      message,
      color: "yellow",
    });
  },

  showInfo: (message: string, title?: string) => {
    notifications.show({
      title: title || "Info",
      message,
      color: "blue",
    });
  },
};
