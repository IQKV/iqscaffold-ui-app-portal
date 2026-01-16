import { useEffect, useRef, useCallback } from "react";

/**
 * useAnnouncer Hook
 *
 * Provides screen reader announcements for dynamic content changes
 * Requirements: 14.2, 14.7
 */

export type AnnouncementPriority = "polite" | "assertive";

interface AnnouncerOptions {
  priority?: AnnouncementPriority;
  timeout?: number;
}

/**
 * Hook for announcing messages to screen readers
 *
 * @returns Object with announce function
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcer elements if they don't exist
    if (!document.getElementById("announcer-polite")) {
      const politeAnnouncer = document.createElement("div");
      politeAnnouncer.id = "announcer-polite";
      politeAnnouncer.setAttribute("role", "status");
      politeAnnouncer.setAttribute("aria-live", "polite");
      politeAnnouncer.setAttribute("aria-atomic", "true");
      politeAnnouncer.style.position = "absolute";
      politeAnnouncer.style.left = "-10000px";
      politeAnnouncer.style.width = "1px";
      politeAnnouncer.style.height = "1px";
      politeAnnouncer.style.overflow = "hidden";
      document.body.appendChild(politeAnnouncer);
    }

    if (!document.getElementById("announcer-assertive")) {
      const assertiveAnnouncer = document.createElement("div");
      assertiveAnnouncer.id = "announcer-assertive";
      assertiveAnnouncer.setAttribute("role", "alert");
      assertiveAnnouncer.setAttribute("aria-live", "assertive");
      assertiveAnnouncer.setAttribute("aria-atomic", "true");
      assertiveAnnouncer.style.position = "absolute";
      assertiveAnnouncer.style.left = "-10000px";
      assertiveAnnouncer.style.width = "1px";
      assertiveAnnouncer.style.height = "1px";
      assertiveAnnouncer.style.overflow = "hidden";
      document.body.appendChild(assertiveAnnouncer);
    }
  }, []);

  const announce = useCallback(
    (message: string, options: AnnouncerOptions = {}) => {
      const { priority = "polite", timeout = 1000 } = options;
      const announcerId =
        priority === "assertive" ? "announcer-assertive" : "announcer-polite";
      const announcer = document.getElementById(announcerId);

      if (announcer) {
        // Clear previous message
        announcer.textContent = "";

        // Set new message after a brief delay to ensure screen readers pick it up
        setTimeout(() => {
          announcer.textContent = message;

          // Clear message after timeout
          setTimeout(() => {
            announcer.textContent = "";
          }, timeout);
        }, 100);
      }
    },
    []
  );

  return { announce };
}
