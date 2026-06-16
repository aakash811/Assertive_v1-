"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCache = readCache;
exports.writeCache = writeCache;
exports.hashFile = hashFile;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const find_project_root_js_1 = require("./find-project-root.js");
const CACHE_DIR = ".assertive";
const CACHE_FILE = "sync-cache.json";
function getCachePath() {
    return node_path_1.default.join((0, find_project_root_js_1.findProjectRoot)(), CACHE_DIR, CACHE_FILE);
}
function readCache() {
    const cachePath = getCachePath();
    if (!node_fs_1.default.existsSync(cachePath)) {
        return {};
    }
    return JSON.parse(node_fs_1.default.readFileSync(cachePath, "utf8"));
}
function writeCache(cache) {
    const cachePath = getCachePath();
    node_fs_1.default.mkdirSync(node_path_1.default.dirname(cachePath), { recursive: true });
    node_fs_1.default.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}
function hashFile(file) {
    const content = node_fs_1.default.readFileSync(file, "utf8");
    return node_crypto_1.default.createHash("sha256").update(content).digest("hex");
}
