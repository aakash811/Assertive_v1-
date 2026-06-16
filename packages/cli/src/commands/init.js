"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initCommand = void 0;
const commander_1 = require("commander");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const find_project_root_1 = require("../utils/find-project-root");
exports.initCommand = new commander_1.Command("init")
    .description("Initialize Assertive")
    .action(() => {
    const projectRoot = (0, find_project_root_1.findProjectRoot)();
    const configPath = node_path_1.default.join(projectRoot, ".assertive.json");
    if (node_fs_1.default.existsSync(configPath)) {
        console.error(".assertive.json already exists");
        return;
    }
    const config = {
        apiUrl: "http://localhost:4321",
        apiKey: "API-KEY",
        framework: "playwright",
    };
    node_fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✓ Created ${configPath}`);
});
