"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDuplicates = findDuplicates;
function findDuplicates(tests) {
    const seen = new Set();
    const duplicates = [];
    for (const test of tests) {
        if (seen.has(test.uniqueId)) {
            duplicates.push(test.uniqueId);
            continue;
        }
        seen.add(test.uniqueId);
    }
    return duplicates;
}
