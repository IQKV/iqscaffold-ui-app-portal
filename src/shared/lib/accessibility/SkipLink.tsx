import React from "react";
import { Anchor } from "@mantine/core";

/**
 * SkipLink Component
 *
 * Provides a skip navigation link for keyboard users
 * Requirements: 14.1, 14.6
 */

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ href, children }) => {
  return (
    <Anchor
      href={href}
      style={{
        position: "absolute",
        left: "-9999px",
        zIndex: 999,
        padding: "1rem",
        backgroundColor: "var(--mantine-color-blue-6)",
        color: "white",
        textDecoration: "none",
        borderRadius: "0 0 4px 0",
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = "0";
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = "-9999px";
      }}
    >
      {children}
    </Anchor>
  );
};
