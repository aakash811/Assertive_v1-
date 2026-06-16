"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssertiveReporter = void 0;
const client_1 = require("./client");
const config_1 = require("./config");
const offline_queue_1 = require("./offline-queue");
const context_1 = require("./context");
const helper_1 = require("@assertive/helper");
class AssertiveReporter {
    client;
    config;
    runBatchId = null;
    results = [];
    offlineMode = false;
    constructor(config = {}) {
        this.config = (0, config_1.resolveConfig)(config);
        this.client = new client_1.AssertiveClient(this.config);
    }
    async onBegin(_config, _suite) {
        const queue = (0, offline_queue_1.loadQueue)();
        const remaining = [];
        for (const item of queue) {
            try {
                const batch = await this.client.createRunBatch(item.batch);
                await this.client.uploadBatch(batch.id, item.results);
            }
            catch {
                remaining.push(item);
            }
        }
        (0, offline_queue_1.saveQueue)(remaining);
        if (queue.length > remaining.length) {
            console.log(`[Assertive] Flushed ${queue.length - remaining.length} queued uploads`);
        }
        try {
            const ciContext = (0, context_1.getCIContext)();
            const batch = await this.client.createRunBatch({
                branch: ciContext.branch,
                commitSha: ciContext.commitSha,
                ciBuildId: ciContext.ciBuildId,
                ciBuildUrl: ciContext.ciBuildUrl,
                environment: ciContext.environment,
            });
            this.runBatchId = batch.id;
            console.log(`[Assertive] Run Batch: ${batch.id}`);
        }
        catch {
            this.offlineMode = true;
            this.runBatchId = `offline-${Date.now()}`;
            console.warn("[Assertive] API unavailable. Running in offline mode.");
        }
    }
    async onTestEnd(test, result) {
        if (!this.runBatchId) {
            return;
        }
        const metadata = helper_1.metadataStore.get(test.title);
        const traceAttachment = result.attachments.find((attachment) => attachment.path?.endsWith("trace.zip"));
        const runResult = {
            uniqueId: test.title,
            status: result.status.toUpperCase(),
            durationMs: result.duration,
            errorMessage: result.error?.message,
            traceUrl: traceAttachment?.path ?? null,
        };
        if (this.offlineMode) {
            this.results.push(runResult);
            return;
        }
        let testCase = await this.client.getTestCaseByUniqueId(test.title);
        if (!testCase) {
            testCase = await this.client.discoverTestCase(test.title, test.title, metadata);
            console.warn(`[Assertive] Discovered TestCase: ${test.title}`);
            return;
        }
        this.results.push(runResult);
        console.log(`[Assertive] Uploaded ${test.title}`);
    }
    async onEnd() {
        if (!this.runBatchId) {
            return;
        }
        if (this.offlineMode) {
            (0, offline_queue_1.enqueue)({
                batch: {
                    branch: process.env.GITHUB_REF_NAME ?? "local",
                    environment: process.env.NODE_ENV ?? "development",
                },
                results: this.results,
            });
            console.log("[Assertive] Stored offline queue");
            return;
        }
        try {
            await this.client.uploadBatch(this.runBatchId, this.results);
            console.log(`[Assertive] Uploaded ${this.results.length} results`);
        }
        catch {
            (0, offline_queue_1.enqueue)({
                batch: {
                    branch: process.env.GITHUB_REF_NAME ?? "local",
                    environment: process.env.NODE_ENV ?? "development",
                },
                results: this.results,
            });
            console.log("[Assertive] Stored offline queue");
        }
    }
}
exports.AssertiveReporter = AssertiveReporter;
