"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findProjectRoot = findProjectRoot;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
function findProjectRoot() {
    let current = process.cwd();
    while (current !== node_path_1.default.dirname(current)) {
        if (node_fs_1.default.existsSync(node_path_1.default.join(current, ".git")) ||
            node_fs_1.default.existsSync(node_path_1.default.join(current, "pnpm-workspace.yaml"))) {
            return current;
        }
        current = node_path_1.default.dirname(current);
    }
    return process.cwd();
}
