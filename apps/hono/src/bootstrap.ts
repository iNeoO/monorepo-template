import { setupInstrumentation } from "@monorepo-template/infra/libs";

setupInstrumentation();
await import("./index.js");
