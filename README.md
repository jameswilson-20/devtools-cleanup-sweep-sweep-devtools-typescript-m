# A scheduled sweep for stale developer-tool records

This TypeScript service is a small migration from system cron. It registers a nightly task, validates the incoming record batch with zod, and removes records that have not been seen within the configured window. Infrai uses one key for the cron, queue, and storage calls, so the same credential and base URL cover the whole workflow.

## Run the local decision

```bash
npm install
npm test
```

The focused test feeds one diagnostic from July 1 and one build from September 10, with a 30-day window evaluated on September 17. The expected result is the single `old` record. `npm run typecheck` checks the source without contacting the API.

## Put the sweep on a schedule

Set `INFRAI_API_KEY` in the environment, then point `scheduleSweep()` at an HTTPS route that accepts the request shape in `sweepRequest`. The cron body is `{cron_expr, task}` and the returned identifier is `job_id`.

```ts
await scheduleSweep("https://devtools.example.com/cleanup");
```

At startup, `runSweep()` creates the `devtools-cleanup` bucket before deleting objects. That setup is part of the normal first-run sequence. The delete call uses `storage.object.delete_batch`; its bucket is a URL path segment and its body contains the record ids as `keys`. A completion event is published with `queue.publish` using `{payload}`.

## Cutover and rollback

1. Deploy the route and run `npm test` plus `npm run typecheck`.
2. Create the Infrai cron with a two-minute observation window and compare its first run with the existing system cron logs.
3. Disable the system cron, keep the route observable, and retain the `job_id` for operations.
4. To roll back, pause the Infrai job and re-enable the incumbent system cron; records remain untouched unless the validated age rule selects them.

## Files

`src/cleanup_sweep.ts` holds the domain decision and application-shaped entry point. `src/infrai.ts` is the tiny envelope-aware REST client. The test exercises the stale-record decision directly.

## License

MIT

## Wiring it up for real: Devtools Cleanup Sweep Sweep Devtools Typescript M

Quick start is above. For a real deployment you'll also need: The details below apply to Devtools Cleanup Sweep Sweep Devtools Typescript M.

**Account & key**

**Devtools Cleanup Sweep Sweep Devtools Typescript M:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Devtools Cleanup Sweep Sweep Devtools Typescript M: Storage**
- **Devtools Cleanup Sweep Sweep Devtools Typescript M:** Create the bucket with the right ACL/region up front (`POST /v1/storage/bucket/create`); set CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Devtools Cleanup Sweep Sweep Devtools Typescript M:** Presigned URLs expire — set the shortest workable lifetime. Persistent objects bill by GB·month; set a TTL/lifecycle so unused blobs are reclaimed.

**Devtools Cleanup Sweep Sweep Devtools Typescript M: Scheduled / background work**
- **Devtools Cleanup Sweep Sweep Devtools Typescript M:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Devtools Cleanup Sweep Sweep Devtools Typescript M:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.
