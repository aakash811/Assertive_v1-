"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanFiles = scanFiles;
const node_path_1 = __importDefault(require("node:path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const find_project_root_js_1 = require("../utils/find-project-root.js");
const load_config_js_1 = require("../utils/load-config.js");
async function scanFiles() {
    const root = (0, find_project_root_js_1.findProjectRoot)();
    const config = (0, load_config_js_1.loadConfig)();
    const patterns = config.include ?? ["**/*.spec.ts", "**/*.test.ts"];
    const ignore = ["**/node_modules/**", "**/dist/**", ...(config.ignore ?? [])];
    const files = await (0, fast_glob_1.default)(patterns, {
        cwd: root,
        ignore,
        absolute: true,
    });
    return files.map((file) => ({
        absolutePath: file,
        relativePath: node_path_1.default.relative(root, file),
    }));
}
