import "@testing-library/jest-dom";
import {
  server,
  startMSWServer,
  stopMSWServer,
  resetMSWServer,
} from "@/shared/mocks/server-exports";
import { i18n } from "@lingui/core";
import { messages } from "../locales/en";

beforeAll(() => {
  startMSWServer();

  i18n.load("en", messages);
  i18n.activate("en");
});

afterEach(() => {
  resetMSWServer();
});

afterAll(() => {
  stopMSWServer();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = function () {};
}
