"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertive = void 0;
const store_1 = require("./store");
function getOrCreate(testName) {
    let metadata = store_1.metadataStore.get(testName);
    if (!metadata) {
        metadata = {
            tags: [],
            fields: {},
        };
        store_1.metadataStore.set(testName, metadata);
    }
    return metadata;
}
exports.assertive = {
    id(testName, value) {
        getOrCreate(testName).id = value;
    },
    owner(testName, value) {
        getOrCreate(testName).owner = value;
    },
    priority(testName, value) {
        getOrCreate(testName).priority = value;
    },
    type(testName, value) {
        getOrCreate(testName).type = value;
    },
    tags(testName, ...tags) {
        getOrCreate(testName).tags.push(...tags);
    },
    field(testName, key, value) {
        getOrCreate(testName).fields[key] = value;
    },
};
