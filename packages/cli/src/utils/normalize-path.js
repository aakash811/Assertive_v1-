"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePath = normalizePath;
function normalizePath(path) {
    return path.replaceAll("\\", "/");
}
