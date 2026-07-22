import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      DB_NAME: "project_test",
    },
    testTimeout: 10000,
    fileParallelism: false, //runs tests sequentially rather than concurrently
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      exclude: ["src/server.ts", "src/db/**"],
    },
  },
});
