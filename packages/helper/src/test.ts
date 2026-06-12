import { assertive } from "./assertive";
import { metadataStore } from "./store";

assertive.owner("auth.login.success", "Alice");

assertive.priority("auth.login.success", "high");

assertive.tags("auth.login.success", "auth", "smoke");

console.log(metadataStore.get("auth.login.success"));
