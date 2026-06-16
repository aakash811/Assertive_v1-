"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCIContext = getCIContext;
function getCIContext() {
    return {
        branch: process.env.GITHUB_REF_NAME || process.env.CI_COMMIT_BRANCH || "local",
        commitSha: process.env.GITHUB_SHA || process.env.CI_COMMIT_SHA,
        ciBuildId: process.env.GITHUB_RUN_ID || process.env.CI_PIPELINE_ID,
        ciBuildUrl: process.env.GITHUB_SERVER_URL &&
            process.env.GITHUB_REPOSITORY &&
            process.env.GITHUB_RUN_ID
            ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
            : undefined,
        environment: process.env.NODE_ENV || "development",
    };
}
