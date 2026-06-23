import "dotenv/config";
import path from "node:path";
import { defineConfig } from "@playwright/test";
import { loadAssertiveConfig } from "@assertive/shared";

const config = loadAssertiveConfig(path.resolve(process.cwd(), "../../"));

export default defineConfig({
  reporter: [
    [
      "../reporter/src",

      {
        apiUrl: config.apiUrl,
        apiKey: config.apiKey,
      },
    ],
  ],

  use: {
    trace: "on",
  },
});
