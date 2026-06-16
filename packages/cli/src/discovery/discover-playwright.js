"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverPlaywrightTests = discoverPlaywrightTests;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const glob_1 = require("glob");
const find_project_root_js_1 = require("../utils/find-project-root.js");
async function discoverPlaywrightTests() {
    const root = (0, find_project_root_js_1.findProjectRoot)();
    const files = await (0, glob_1.glob)("**/*.spec.ts", {
        cwd: root,
        ignore: ["**/node_modules/**", "**/dist/**"],
    });
    const tests = [];
    for (const file of files) {
        const content = node_fs_1.default.readFileSync(node_path_1.default.join(root, file), "utf8");
        const matches = content.matchAll(/test\(\s*["'`](.*?)["'`]/g);
        for (const match of matches) {
            tests.push({
                uniqueId: match[1],
                title: match[1],
            });
        }
    }
    return tests;
}
