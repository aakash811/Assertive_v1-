"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiPost = apiPost;
exports.apiGet = apiGet;
const load_config_1 = require("../utils/load-config");
function validateConfig() {
    const config = (0, load_config_1.loadConfig)();
    if (!config.apiUrl) {
        throw new Error("apiUrl is missing");
    }
    if (!config.apiKey) {
        throw new Error("apiKey is missing");
    }
    return config;
}
async function apiPost(path, body) {
    const config = validateConfig();
    const response = await fetch(`${config.apiUrl}${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
}
async function apiGet(path) {
    const config = validateConfig();
    const response = await fetch(`${config.apiUrl}${path}`, {
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
}
