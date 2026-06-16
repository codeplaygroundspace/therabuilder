import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Compile JSX/TSX with the automatic runtime so test files can render components
  // with react-dom/server without importing React explicitly.
  esbuild: { jsx: "automatic" },
  resolve: {
    // Mirror the tsconfig @/* → ./src/* path alias so runtime imports work in tests.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
