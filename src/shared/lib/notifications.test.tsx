import { describe, it, expect, vi, beforeEach } from "vitest";
import { notifications } from "@mantine/notifications";
import { notificationService } from "./notifications";

// Mock @mantine/notifications
vi.mock("@mantine/notifications", () => ({
  notifications: {
    show: vi.fn(),
    update: vi.fn(),
    hide: vi.fn(),
    clean: vi.fn(),
  },
}));

describe("Notification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("success", () => {
    it("shows success notification with default values", () => {
      notificationService.success({ message: "Operation successful" });

      expect(notifications.show).toHaveBeenCalledWith({
        title: "Success",
        message: "Operation successful",
        color: "green",
        icon: expect.any(Object),
        autoClose: 4000,
      });
    });

    it("shows success notification with custom values", () => {
      notificationService.success({
        title: "Custom Success",
        message: "Custom message",
        autoClose: 2000,
      });

      expect(notifications.show).toHaveBeenCalledWith({
        title: "Custom Success",
        message: "Custom message",
        color: "green",
        icon: expect.any(Object),
        autoClose: 2000,
      });
    });

    it("handles autoClose false", () => {
      notificationService.success({
        message: "Persistent message",
        autoClose: false,
      });

      expect(notifications.show).toHaveBeenCalledWith({
        title: "Success",
        message: "Persistent message",
        color: "green",
        icon: expect.any(Object),
        autoClose: false,
      });
    });
  });

  describe("error", () => {
    it("shows error notification with default values", () => {
      notificationService.error({ message: "Something went wrong" });

      expect(notifications.show).toHaveBeenCalledWith({
        title: "Error",
        message: "Something went wrong",
        color: "red",
        icon: expect.any(Object),
        autoClose: 6000,
      });
    });

    it("shows error notification with custom values", () => {
      notificationService.error({
        title: "Custom Error",
        message: "Custom error message",
        autoClose: 8000,
      });

      expect(notifications.show).toHaveBeenCalledWith({
        title: "Custom Error",
        message: "Custom error message",
        color: "red",
        icon: expect.any(Object),
        autoClose: 8000,
      });
    });
  });

  describe("warning", () => {
    it("shows warning notification with default values", () => {
      notificationService.warning({ message: "Warning message" });

      expect(notifications.show).toHaveBeenCalledWith({
        title: "Warning",
        message: "Warning message",
        color: "yellow",
        icon: expect.any(Object),
        autoClose: 5000,
      });
    });

    it("shows warning notification with custom values", () => {
      notificationService.warning({
        title: "Custom Warning",
        message: "Custom warning message",
        autoClose: 3000,
      });

      expect(notifications.show).toHaveBeenCalledWith({
        title: "Custom Warning",
        message: "Custom warning message",
        color: "yellow",
        icon: expect.any(Object),
        autoClose: 3000,
      });
    });
  });

  describe("info", () => {
    it("shows info notification with default values", () => {
      notificationService.info({ message: "Info message" });

      expect(notifications.show).toHaveBeenCalledWith({
        title: "Info",
        message: "Info message",
        color: "blue",
        icon: expect.any(Object),
        autoClose: 4000,
      });
    });

    it("shows info notification with custom values", () => {
      notificationService.info({
        title: "Custom Info",
        message: "Custom info message",
        autoClose: 2500,
      });

      expect(notifications.show).toHaveBeenCalledWith({
        title: "Custom Info",
        message: "Custom info message",
        color: "blue",
        icon: expect.any(Object),
        autoClose: 2500,
      });
    });
  });

  describe("loading", () => {
    it("shows loading notification with default title", () => {
      const id = notificationService.loading({ message: "Loading data..." });

      expect(notifications.show).toHaveBeenCalledWith({
        id: "loading",
        title: "Loading",
        message: "Loading data...",
        loading: true,
        autoClose: false,
        withCloseButton: false,
      });
    });

    it("shows loading notification with custom title", () => {
      notificationService.loading({
        title: "Processing",
        message: "Please wait...",
      });

      expect(notifications.show).toHaveBeenCalledWith({
        id: "loading",
        title: "Processing",
        message: "Please wait...",
        loading: true,
        autoClose: false,
        withCloseButton: false,
      });
    });
  });

  describe("updateLoading", () => {
    it("updates loading notification to success", () => {
      notificationService.updateLoading("test-id", {
        title: "Complete",
        message: "Operation completed",
        type: "success",
      });

      expect(notifications.update).toHaveBeenCalledWith({
        id: "test-id",
        title: "Complete",
        message: "Operation completed",
        loading: false,
        autoClose: 4000,
        color: "green",
        icon: expect.any(Object),
      });
    });

    it("updates loading notification to error", () => {
      notificationService.updateLoading("test-id", {
        title: "Failed",
        message: "Operation failed",
        type: "error",
      });

      expect(notifications.update).toHaveBeenCalledWith({
        id: "test-id",
        title: "Failed",
        message: "Operation failed",
        loading: false,
        autoClose: 4000,
        color: "red",
        icon: expect.any(Object),
      });
    });

    it("defaults to success type", () => {
      notificationService.updateLoading("test-id", {
        title: "Done",
        message: "All done",
      });

      expect(notifications.update).toHaveBeenCalledWith({
        id: "test-id",
        title: "Done",
        message: "All done",
        loading: false,
        autoClose: 4000,
        color: "green",
        icon: expect.any(Object),
      });
    });
  });

  describe("hide", () => {
    it("hides notification by id", () => {
      notificationService.hide("test-id");
      expect(notifications.hide).toHaveBeenCalledWith("test-id");
    });
  });

  describe("clean", () => {
    it("cleans all notifications", () => {
      notificationService.clean();
      expect(notifications.clean).toHaveBeenCalled();
    });
  });
});
