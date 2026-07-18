import { Command } from "commander";
import fs from "node:fs";
import { parseStringPromise } from "xml2js";
import { apiPost } from "../lib/api.js";

function mapJUnitStatus(status: string): "PASSED" | "FAILED" | "SKIPPED" {
  switch (status) {
    case "passed":
      return "PASSED";
    case "failed":
      return "FAILED";
    case "skipped":
      return "SKIPPED";
    default:
      return "SKIPPED";
  }
}

async function parseJUnitXml(file: string) {
  const xml = fs.readFileSync(file, "utf-8");
  const parsed = await parseStringPromise(xml, { explicitArray: false });

  const results: Array<{
    externalId: string;
    status: "PASSED" | "FAILED" | "SKIPPED";
    durationMs?: number;
    errorMessage?: string;
    errorStack?: string;
    browser?: string;
    os?: string;
    attemptNumber?: number;
    retryOf?: string;
  }> = [];

  const testSuites =
    parsed.testsuites ?? parsed.testsuite ?? { testsuite: [] };

  const suites = Array.isArray(testSuites.testsuite)
    ? testSuites.testsuite
    : [testSuites.testsuite].filter(Boolean);

  for (const suite of suites) {
    const testCases = Array.isArray(suite.testcase)
      ? suite.testcase
      : [suite.testcase].filter(Boolean);

    for (const testCase of testCases) {
      const externalId = testCase.name ?? testCase.classname ?? "unknown";
      const status = mapJUnitStatus(
        testCase.$?.status ?? testCase.failure ? "failed" : "passed",
      );

      const durationMs = testCase.$?.time
        ? Math.round(Number(testCase.$.time) * 1000)
        : undefined;

      const failure = testCase.failure ?? testCase.error;
      const skipped = testCase.skipped;

      let errorMessage: string | undefined;
      let errorStack: string | undefined;

      if (failure && typeof failure === "object") {
        errorMessage = failure.$?.message ?? failure.message;
        errorStack = typeof failure === "string" ? failure : failure._;
      }

      if (skipped) {
        errorMessage = skipped.$?.message ?? skipped.message ?? "Skipped";
      }

      results.push({
        externalId,
        status,
        durationMs,
        errorMessage,
        errorStack,
        browser: process.env.PLAYWRIGHT_BROWSERS,
        os: process.platform,
        attemptNumber: 1,
      });
    }
  }

  return results;
}

async function parseJson(file: string) {
  const raw = fs.readFileSync(file, "utf-8");
  const payload = JSON.parse(raw);
  const results = Array.isArray(payload) ? payload : payload.results;

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error("Upload file must contain a non-empty results array.");
  }

  return results;
}

export const uploadCommand = new Command("upload")
  .option("--format <format>", "Upload format: json or junit", "json")
  .argument("<file>")
  .description("Upload test results")
  .action(async (file, options) => {
    if (!fs.existsSync(file)) {
      console.error(`File not found: ${file}`);
      process.exit(1);
    }

    try {
      const results =
        options.format === "junit"
          ? await parseJUnitXml(file)
          : await parseJson(file);

      const batch = await apiPost("/api/run-batches", {
        branch: "local",
        environment: "local",
        triggeredBy: "local",
      });

      const result = await apiPost(`/api/run-batches/${batch.id}/upload`, {
        results,
      });

      console.log(`✓ Uploaded ${result.uploaded} test result(s)`);
    } catch (error) {
      console.error(
        `Upload failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      process.exit(1);
    }
  });
