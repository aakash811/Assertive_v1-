"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadQueue = loadQueue;
exports.saveQueue = saveQueue;
exports.enqueue = enqueue;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const QUEUE_FILE = node_path_1.default.join(process.cwd(), ".assertive-queue.json");
function loadQueue() {
    if (!node_fs_1.default.existsSync(QUEUE_FILE)) {
        return [];
    }
    return JSON.parse(node_fs_1.default.readFileSync(QUEUE_FILE, "utf-8"));
}
function saveQueue(items) {
    node_fs_1.default.writeFileSync(QUEUE_FILE, JSON.stringify(items, null, 2), "utf-8");
}
function enqueue(item) {
    const queue = loadQueue();
    queue.push(item);
    saveQueue(queue);
}
