import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: {
      DB_NAME: "loop_test", // ensures tests always target the test DB regardless of local .env settings
    },
    testTimeout: 10000,
    fileParallelism: false, //runs tests sequentially rather than concurrently
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      exclude: ["src/server.ts", "src/db/**"], // excludes startup/infrastructure code from coverage — not meaningful to unit/integration test
    },
  },
});
