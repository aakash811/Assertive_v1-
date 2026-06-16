"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const client = new client_1.AssertiveClient({
    apiUrl: "http://localhost:4321",
    apiKey: "ask_live_6e427d13f0d10ecbe249e0e32665178a45f20aceb383b2af",
});
async function main() {
    const batch = await client.createRunBatch({
        branch: "main",
        environment: "local",
    });
    console.log(batch);
}
main();
