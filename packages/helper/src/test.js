"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assertive_1 = require("./assertive");
const store_1 = require("./store");
assertive_1.assertive.owner("auth.login.success", "Alice");
assertive_1.assertive.priority("auth.login.success", "high");
assertive_1.assertive.tags("auth.login.success", "auth", "smoke");
console.log(store_1.metadataStore.get("auth.login.success"));
