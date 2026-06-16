"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.linkCommand = void 0;
const commander_1 = require("commander");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const load_config_js_1 = require("../utils/load-config.js");
const find_project_root_js_1 = require("../utils/find-project-root.js");
exports.linkCommand = new commander_1.Command("link")
    .description("Link project")
    .argument("<projectId>")
    .action((projectId) => {
    const root = (0, find_project_root_js_1.findProjectRoot)();
    const configPath = node_path_1.default.join(root, ".assertive.json");
    const config = (0, load_config_js_1.loadConfig)();
    const updatedConfig = {
        ...config,
        projectId,
    };
    node_fs_1.default.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), "utf8");
    console.log(`Linked project ${projectId} to Assertive`);
});
