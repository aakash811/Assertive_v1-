"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.resolveConfig = resolveConfig;
exports.defaultConfig = {
    environment: "local",
    uploadTraces: false,
    retries: 3,
};
function resolveConfig(config = {}) {
    return {
        apiUrl: config.apiUrl ?? process.env.ASSERTIVE_API_URL ?? "http://localhost:4321",
        apiKey: config.apiKey ?? process.env.ASSERTIVE_API_KEY ?? "",
        environment: config.environment ?? exports.defaultConfig.environment,
        uploadTraces: config.uploadTraces ?? exports.defaultConfig.uploadTraces,
        retries: config.retries ?? exports.defaultConfig.retries,
    };
}
