import "dotenv/config";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: [["../reporter/src", {}]],
  use: {
    trace: "on",
  },
});
