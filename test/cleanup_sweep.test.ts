import assert from "node:assert/strict";
import { staleRecords } from "../src/cleanup_sweep.js";

const result = staleRecords({records:[{id:"old",kind:"diagnostic",lastSeen:"2026-07-01T00:00:00.000Z"},{id:"new",kind:"build",lastSeen:"2026-09-10T00:00:00.000Z"}],staleAfterDays:30}, new Date("2026-09-17T00:00:00.000Z"));
assert.deepEqual(result.map(record => record.id), ["old"]);
console.log("stale decision test passed");
