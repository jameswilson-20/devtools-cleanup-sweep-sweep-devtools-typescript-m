import { z } from "zod";
import { infrai } from "./infrai.js";

export const sweepRequest = z.object({
  records: z.array(z.object({id:z.string(), kind:z.enum(["build", "release", "diagnostic"]), lastSeen:z.string().datetime()})),
  staleAfterDays: z.number().int().positive().default(30)
});
export type SweepRequest = z.infer<typeof sweepRequest>;

export function staleRecords(input: SweepRequest, now = new Date()): SweepRequest["records"] {
  const cutoff = now.getTime() - input.staleAfterDays * 86400000;
  return input.records.filter(record => new Date(record.lastSeen).getTime() < cutoff);
}

export async function scheduleSweep(taskUrl: string) {
  return infrai.cron.create({ cron_expr: "0 2 * * *", task: taskUrl });
}

export async function runSweep(raw: unknown, bucket = "devtools-cleanup", queue = "devtools-cleanup") {
  const input = sweepRequest.parse(raw);
  const stale = staleRecords(input);
  if (stale.length) await infrai.storage.object.delete_batch(bucket, {keys: stale.map(record => record.id)});
  await infrai.queue.publish({queue, payload: JSON.stringify({event:"cleanup.sweep.completed", deleted: stale.length})});
  return {deleted: stale.length, kinds: [...new Set(stale.map(record => record.kind))]};
}

if (process.argv[1]?.endsWith("cleanup_sweep.ts")) {
  const sampleId = `build-${crypto.randomUUID()}`;
  const sample = {records:[{id:sampleId,kind:"build",lastSeen:"2024-01-01T00:00:00.000Z"},{id:"release-4",kind:"release",lastSeen:"2026-09-16T00:00:00.000Z"}],staleAfterDays:30};
  runSweep(sample).then(result => console.log(JSON.stringify(result))).catch(error => { console.error(error); process.exitCode = 1; });
}
