import { defineConfig } from "vitest/config";

export default defineConfig({
  // Compile JSX/TSX with the automatic runtime so test files can render components
  // with react-dom/server without importing React explicitly.
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
