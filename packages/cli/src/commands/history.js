"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyCommand = void 0;
const commander_1 = require("commander");
const api_1 = require("../lib/api");
exports.historyCommand = new commander_1.Command("history")
    .argument("<uniqueId>")
    .description("Show test history")
    .action(async (uniqueId) => {
    try {
        const result = await (0, api_1.apiGet)(`/api/history/${encodeURIComponent(uniqueId)}`);
        console.log("");
        console.log("History");
        console.log("=======");
        console.log("");
        for (const item of result.items) {
            console.log(item.action);
            console.log(new Date(item.createdAt).toLocaleString());
            if (item.changes) {
                for (const [field, value] of Object.entries(item.changes)) {
                    const change = value;
                    console.log(`${field}:`);
                    console.log(` ${change.from} → ${change.to}`);
                }
            }
            console.log("");
        }
    }
    catch (error) {
        console.error(error instanceof Error ? error.message : error);
    }
});
