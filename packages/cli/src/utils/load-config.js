"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const find_project_root_1 = require("./find-project-root");
function loadConfig() {
    const projectRoot = (0, find_project_root_1.findProjectRoot)();
    const configPath = node_path_1.default.join(projectRoot, ".assertive.json");
    if (!node_fs_1.default.existsSync(configPath)) {
        throw new Error("Missing .assertive.json. Run 'assertive init' to create one.");
    }
    const config = JSON.parse(node_fs_1.default.readFileSync(configPath, "utf-8"));
    if (!config.apiUrl) {
        throw new Error("Missing apiUrl in .assertive.json");
    }
    if (!config.apiKey) {
        throw new Error("Missing apiKey in .assertive.json");
    }
    return config;
}
