"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChangedFiles = getChangedFiles;
const sync_cache_js_1 = require("./sync-cache.js");
const sync_cache_js_2 = require("./sync-cache.js");
function getChangedFiles(files) {
    const cache = (0, sync_cache_js_2.readCache)();
    const changed = [];
    const updated = { ...cache };
    for (const file of files) {
        const hash = (0, sync_cache_js_1.hashFile)(file.absolutePath);
        if (cache[file.absolutePath] !== hash) {
            changed.push(file.absolutePath);
        }
        updated[file.absolutePath] = hash;
    }
    (0, sync_cache_js_2.writeCache)(updated);
    return changed;
}
