declare module "../locales/en" {
  export const messages: Record<string, any>;
}

declare module "../locales/*" {
  const messages: Record<string, any>;
  export { messages };
}
