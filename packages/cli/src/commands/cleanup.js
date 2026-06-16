"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupCommand = void 0;
const commander_1 = require("commander");
const api_1 = require("../lib/api");
exports.cleanupCommand = new commander_1.Command("cleanup")
    .description("Cleanup expired data")
    .action(async () => {
    try {
        const result = await (0, api_1.apiPost)("/api/cleanup");
        console.log("");
        console.log("Cleanup Complete");
        console.log("==============");
        console.log(`Runs deleted: ${result.runs}`);
        console.log(`History deleted: ${result.history}`);
        console.log(`Traces deleted: ${result.traces}`);
        console.log("");
    }
    catch (error) {
        console.error(error);
    }
});
