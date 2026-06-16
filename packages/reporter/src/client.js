"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssertiveClient = void 0;
class AssertiveClient {
    config;
    constructor(config) {
        this.config = config;
    }
    headers() {
        return {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
        };
    }
    async createRunBatch(payload) {
        const response = await fetch(`${this.config.apiUrl}/api/run-batches`, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify(payload),
        });
        return response.json();
    }
    async createTestRun(payload) {
        const response = await fetch(`${this.config.apiUrl}/api/test-runs`, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify(payload),
        });
        return response.json();
    }
    async getTestCaseByUniqueId(uniqueId) {
        const response = await fetch(`${this.config.apiUrl}/api/test-cases/by-unique-id/${encodeURIComponent(uniqueId)}`, {
            headers: this.headers(),
        });
        if (!response.ok) {
            return null;
        }
        return response.json();
    }
    async discoverTestCase(uniqueId, title, metadata) {
        const response = await fetch(`${this.config.apiUrl}/api/test-cases/discover`, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify({
                uniqueId,
                title,
                metadata,
            }),
        });
        return response.json();
    }
    async uploadBatch(runBatchId, results) {
        const response = await fetch(`${this.config.apiUrl}/api/run-batches/${runBatchId}/upload`, {
            method: "POST",
            headers: this.headers(),
            body: JSON.stringify({ results }),
        });
        return response.json();
    }
}
exports.AssertiveClient = AssertiveClient;
