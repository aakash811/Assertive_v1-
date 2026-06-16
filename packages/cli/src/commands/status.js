"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusCommand = void 0;
const commander_1 = require("commander");
const api_1 = require("../lib/api");
exports.statusCommand = new commander_1.Command("status")
    .description("Show sync status")
    .action(async () => {
    try {
        const result = await (0, api_1.apiGet)("/api/status");
        console.log("");
        console.log("Project Status");
        console.log("==============");
        console.log(`Total: ${result.total}`);
        console.log(`Synced: ${result.synced}`);
        console.log(`Stale: ${result.stale}`);
        console.log("");
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : error);
    }
});
