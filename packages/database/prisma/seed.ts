import crypto from "node:crypto";
import { PrismaClient, Prisma, TestStatus } from "@prisma/client";

const prisma = new PrismaClient();

const API_SCOPES = [
  "projects:read",
  "projects:write",
  "api-keys:read",
  "api-keys:write",
  "tests:read",
  "tests:write",
  "runs:read",
  "runs:write",
  "analytics:read",
];

const OWNERS = ["Platform Team", "QA Team", "Alice", "Bob", "CI Bot"];

const PRIORITIES = ["Critical", "High", "Medium", "Low"];

const TEST_TYPES = ["UI", "API", "Integration", "Regression", "Smoke"];

const BRANCHES = [
  "main",
  "develop",
  "feature/auth",
  "feature/dashboard",
  "feature/payments",
  "release/v1",
];

const ENVIRONMENTS = ["development", "staging", "production"];

const TRIGGERED_BY = ["GitHub Actions", "Aakash", "Dependabot"];

const BROWSERS = ["chromium", "firefox", "webkit"];

const OPERATING_SYSTEMS = ["linux", "windows", "macos"];

const FAILURE_MESSAGES = [
  "Timeout exceeded",
  "Assertion failed",
  "Locator not found",
  "Network error",
  "Element detached",
];

const SUITES = [
  "Authentication",
  "Dashboard",
  "Payments",
  "Checkout",
  "Search",
];

const TAGS = [
  "Smoke",
  "Regression",
  "Critical",
  "Authentication",
  "Payments",
  "Search",
];

function random<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomStatus(): TestStatus {
  const value = Math.random();

  if (value < 0.7) return "PASSED";
  if (value < 0.9) return "FAILED";
  if (value < 0.95) return "SKIPPED";

  return "UNKNOWN";
}

function randomFlakyScore() {
  return Number((Math.random() * 0.8).toFixed(2));
}

function hashApiKey(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

async function seedOrganization() {
  return prisma.organization.upsert({
    where: {
      slug: "assertive-labs",
    },

    update: {},

    create: {
      name: "Assertive Labs",
      slug: "assertive-labs",
    },
  });
}

async function seedUsers(orgId: string) {
  const owner = await prisma.user.upsert({
    where: {
      email: "aakash@assertive.dev",
    },

    update: {},

    create: {
      name: "Aakash Borse",
      email: "aakash@assertive.dev",
    },
  });

  const bot = await prisma.user.upsert({
    where: {
      email: "ci@assertive.dev",
    },

    update: {},

    create: {
      name: "CI Bot",
      email: "ci@assertive.dev",
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_orgId: {
        userId: owner.id,
        orgId,
      },
    },

    update: {},

    create: {
      userId: owner.id,
      orgId,
      role: "owner",
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      userId_orgId: {
        userId: bot.id,
        orgId,
      },
    },

    update: {},

    create: {
      userId: bot.id,
      orgId,
      role: "admin",
    },
  });

  return {
    owner,
    bot,
  };
}

async function seedProjects(orgId: string) {
  const web = await prisma.project.upsert({
    where: {
      slug: "web-platform",
    },

    update: {},

    create: {
      name: "Web Platform",
      slug: "web-platform",
      organizationId: orgId,
    },
  });

  const api = await prisma.project.upsert({
    where: {
      slug: "api-platform",
    },

    update: {},

    create: {
      name: "API Platform",
      slug: "api-platform",
      organizationId: orgId,
    },
  });

  return [web, api];
}

async function seedApiKeys(orgId: string) {
  const keys = ["local-dev", "github-actions"];

  const rawKeys: Record<string, string> = {};

  for (const name of keys) {
    const existing = await prisma.apiKey.findFirst({
      where: {
        organizationId: orgId,
        name,
      },
    });

    if (existing) {
      console.log(`✓ API key '${name}' already exists`);
      continue;
    }

    const raw = "ask_live_" + crypto.randomBytes(24).toString("hex");

    rawKeys[name] = raw;

    await prisma.apiKey.create({
      data: {
        name,
        hashedKey: hashApiKey(raw),
        organizationId: orgId,
        scopes: API_SCOPES,
      },
    });
  }

  if (Object.keys(rawKeys).length) {
    console.log("\nGenerated API Keys\n");

    for (const [name, key] of Object.entries(rawKeys)) {
      console.log(`${name}: ${key}`);
    }

    console.log();
  }
}

async function seedSuites(projectId: string) {
  const suites = [];

  for (const name of SUITES) {
    let suite = await prisma.testSuite.findFirst({
      where: {
        projectId,
        name,
      },
    });

    if (!suite) {
      suite = await prisma.testSuite.create({
        data: {
          name,
          projectId,
        },
      });
    }

    suites.push(suite);
  }

  return suites;
}

async function seedTags(projectId: string) {
  const tags = [];

  for (const name of TAGS) {
    const tag = await prisma.tag.upsert({
      where: {
        projectId_name: {
          projectId,
          name,
        },
      },

      update: {},

      create: {
        projectId,
        name,
      },
    });

    tags.push(tag);
  }

  return tags;
}

const TEST_TITLES = [
  "Login with valid credentials",
  "Login with invalid password",
  "Forgot password flow",
  "Reset password",
  "Enable two factor authentication",
  "Disable two factor authentication",
  "Dashboard loads successfully",
  "Dashboard widgets render",
  "Create project",
  "Delete project",
  "Rename project",
  "Create API key",
  "Revoke API key",
  "View analytics summary",
  "Generate report",
  "Upload trace",
  "Download trace",
  "Create test suite",
  "Delete test suite",
  "Move test to suite",
  "Search by title",
  "Search by owner",
  "Search by tag",
  "Filter failed tests",
  "Filter flaky tests",
  "Archive test case",
  "Restore archived test",
  "Sync inventory",
  "Detect stale tests",
  "View history timeline",
  "Export analytics",
  "Open run batch",
  "Retry failed run",
  "View run details",
  "Override execution status",
  "Clear manual override",
  "Update metadata",
  "Assign tags",
  "Remove tag",
  "Pagination works",
  "Sorting by updated date",
  "Project settings update",
  "Organization members load",
  "CI upload completes",
  "Large inventory sync",
  "Retry upload",
  "Offline queue replay",
  "Webhook delivery",
  "Create notification",
  "Delete notification",
];

async function seedTestCases(
  projectId: string,
  suites: Awaited<ReturnType<typeof seedSuites>>,
  tags: Awaited<ReturnType<typeof seedTags>>,
) {
  const created = [];

  for (let i = 1; i <= 50; i++) {
    const suite = random(suites);

    const externalId = `${projectId.slice(0, 4).toUpperCase()}-${String(i).padStart(3, "0")}`;

    const title = `${TEST_TITLES[(i - 1) % TEST_TITLES.length]} #${i}`;

    const flakyScore = randomFlakyScore();

    const test = await prisma.testCase.upsert({
      where: {
        projectId_externalId: {
          projectId,
          externalId,
        },
      },

      update: {},

      create: {
        externalId,

        title,

        description: `${title} should behave correctly.`,

        filePath: `tests/${suite.name.toLowerCase()}/${externalId.toLowerCase()}.spec.ts`,

        owner: random(OWNERS),

        priority: random(PRIORITIES),

        testType: random(TEST_TYPES),

        customFields: {},

        lastStatus: randomStatus(),

        syncState: Math.random() < 0.95 ? "SYNCED" : "STALE",

        lifecycle: "ACTIVE",

        suiteId: suite.id,

        projectId,

        flakyScore,

        isFlaky: flakyScore >= 0.3,
      },
    });

    created.push(test);

    const shuffled = [...tags].sort(() => Math.random() - 0.5);

    const count = randomInt(1, 3);

    for (const tag of shuffled.slice(0, count)) {
      await prisma.testCaseTag.upsert({
        where: {
          testCaseId_tagId: {
            testCaseId: test.id,
            tagId: tag.id,
          },
        },

        update: {},

        create: {
          testCaseId: test.id,
          tagId: tag.id,
        },
      });
    }
  }

  console.log(
    `✓ ${created.length} test cases created for project ${projectId}`,
  );

  return created;
}

async function seedRunBatches(projectId: string) {
  const batches = [];

  for (let i = 1; i <= 10; i++) {
    const branch = random(BRANCHES);

    const commitSha = crypto.randomBytes(20).toString("hex").slice(0, 8);

    const batch = await prisma.runBatch.create({
      data: {
        branch,

        commitSha,

        environment: random(ENVIRONMENTS),

        triggeredBy: random(TRIGGERED_BY),

        ciBuildId: `GH-${1000 + i}`,

        ciBuildUrl: `https://github.com/assertive/actions/${1000 + i}`,

        totalCount: 0,

        passedCount: 0,

        failedCount: 0,

        skippedCount: 0,

        uploadCompleted: true,

        uploadedAt: new Date(),

        projectId,
      },
    });

    batches.push(batch);
  }

  return batches;
}

async function seedRuns(
  batches: Awaited<ReturnType<typeof seedRunBatches>>,
  tests: Awaited<ReturnType<typeof seedTestCases>>,
) {
  let createdRuns = 0;

  for (const batch of batches) {
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    const shuffled = [...tests].sort(() => Math.random() - 0.5);

    const runCount = randomInt(18, 30);

    for (const test of shuffled.slice(0, runCount)) {
      const status = randomStatus();

      if (status === "PASSED") passed++;

      if (status === "FAILED") failed++;

      if (status === "SKIPPED") skipped++;

      const retry = status === "FAILED" ? randomInt(1, 2) : 1;

      await prisma.testRun.create({
        data: {
          status,

          durationMs: randomInt(50, 3000),

          browser: random(BROWSERS),

          os: random(OPERATING_SYSTEMS),

          attemptNumber: retry,

          errorMessage: status === "FAILED" ? random(FAILURE_MESSAGES) : null,

          errorStack: status === "FAILED" ? "Stack trace..." : null,

          traceUrl:
            Math.random() < 0.6
              ? `https://storage.assertive.dev/traces/${crypto.randomUUID()}.zip`
              : null,

          runBatchId: batch.id,

          testCaseId: test.id,
        },
      });

      createdRuns++;

      await prisma.testCase.update({
        where: {
          id: test.id,
        },

        data: {
          lastStatus: status,
        },
      });
    }

    await prisma.runBatch.update({
      where: {
        id: batch.id,
      },

      data: {
        totalCount: passed + failed + skipped,

        passedCount: passed,

        failedCount: failed,

        skippedCount: skipped,
      },
    });
  }

  console.log(`✓ ${createdRuns} test runs created`);
}

const HISTORY_ACTIONS = [
  "CREATED",
  "UPDATED",
  "STATUS_CHANGED",
  "MANUAL_OVERRIDE",
  "RESTORED",
  "ARCHIVED",
];

async function seedHistory(tests: Awaited<ReturnType<typeof seedTestCases>>) {
  let count = 0;

  for (const test of tests) {
    const historyEntries = randomInt(1, 4);

    for (let i = 0; i < historyEntries; i++) {
      const action = random(HISTORY_ACTIONS);

      await prisma.testCaseHistory.create({
        data: {
          testCaseId: test.id,

          action,

          changedBy: random([
            "Aakash",
            "CI Bot",
            "GitHub Actions",
            "Platform Team",
          ]),

          comment:
            Math.random() < 0.35
              ? random([
                  "Automatic sync",
                  "Metadata updated",
                  "Manual verification",
                  "Regression detected",
                  "Investigated by QA",
                  "False positive",
                  "Restored during sync",
                ])
              : null,

          changes:
            action === "UPDATED" || action === "STATUS_CHANGED"
              ? {
                  previousStatus: random(["PASSED", "FAILED", "SKIPPED"]),
                  currentStatus: random(["PASSED", "FAILED", "SKIPPED"]),
                }
              : Prisma.JsonNull,
        },
      });

      count++;
    }
  }

  console.log(`✓ ${count} history records created`);
}

async function printStatistics() {
  const [
    organizations,
    users,
    projects,
    suites,
    tags,
    apiKeys,
    tests,
    batches,
    runs,
    history,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.project.count(),
    prisma.testSuite.count(),
    prisma.tag.count(),
    prisma.apiKey.count(),
    prisma.testCase.count(),
    prisma.runBatch.count(),
    prisma.testRun.count(),
    prisma.testCaseHistory.count(),
  ]);

  console.log("");
  console.log("====================================");
  console.log(" Assertive Demo Database Ready");
  console.log("====================================");
  console.log(`Organizations : ${organizations}`);
  console.log(`Users         : ${users}`);
  console.log(`Projects      : ${projects}`);
  console.log(`Suites        : ${suites}`);
  console.log(`Tags          : ${tags}`);
  console.log(`API Keys      : ${apiKeys}`);
  console.log(`Test Cases    : ${tests}`);
  console.log(`Run Batches   : ${batches}`);
  console.log(`Runs          : ${runs}`);
  console.log(`History       : ${history}`);
  console.log("====================================");
}

async function main() {
  const organization = await seedOrganization();

  await seedUsers(organization.id);

  await seedApiKeys(organization.id);

  const projects = await seedProjects(organization.id);

  await prisma.$transaction([
    prisma.testCaseHistory.deleteMany(),
    prisma.testRun.deleteMany(),
    prisma.runBatch.deleteMany(),
    prisma.testCaseTag.deleteMany(),
    prisma.testCase.deleteMany(),
    prisma.testSuite.deleteMany(),
    prisma.tag.deleteMany(),
  ]);

  let totalTests = 0;

  for (const project of projects) {
    const suites = await seedSuites(project.id);

    const tags = await seedTags(project.id);

    const tests = await seedTestCases(project.id, suites, tags);

    totalTests += tests.length;

    const batches = await seedRunBatches(project.id);

    await seedRuns(batches, tests);

    await seedHistory(tests);
  }

  console.log(`✓ ${totalTests} test cases created`);

  await printStatistics();
}

export { main as seedDatabase };

if (process.argv[1] && process.argv[1].includes('seed.ts')) {
  main()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

// async function main() {
//   const organization = await seedOrganization();

//   await seedUsers(organization.id);

//   await seedApiKeys(organization.id);

//   const projects = await seedProjects(organization.id);

//   const allTests = [];

//   for (const project of projects) {
//     const suites = await seedSuites(project.id);

//     const tags = await seedTags(project.id);

//     const tests = await seedTestCases(project.id, suites, tags);

//     const batches = await seedRunBatches(project.id);

//     await seedRuns(batches, tests);

//     allTests.push(...tests);
//   }

//   console.log(`\nCreated ${allTests.length} total test cases.`);
// }
