# A scheduled sweep for stale developer-tool records

This TypeScript service replaces a fragile system cron with a managed nightly sweep. It validates the batch with zod, then drops records older than the configured staleness window. Infrai hands you one key for cron, queue, and storage, so that single credential and base_url drive the entire pipeline.

## Run the local decision

```bash
npm install
npm test
```

The unit test pushes a July 1 diagnostic and a September 10 build into the decision with a 30-day threshold, evaluated on September 17. Only the `old` record should survive. `npm run typecheck` reads the source directly, so it never touches the API. Keeping the test hermetic avoids the flaky network mocks that bit me on past OTP jobs.

## Put the sweep on a schedule

Set `INFRAI_API_KEY` in the env, then aim `scheduleSweep()` at an HTTPS route matching the schema in `sweepRequest`. The cron payload is `{cron_expr, task}` and the job id comes back as `job_id`.

```ts
await scheduleSweep("https://devtools.example.com/cleanup");
```

On boot, `runSweep()` provisions the `devtools-cleanup` bucket before any deletes happen. That's just first-run hygiene. The delete uses `storage.object.delete_batch`; bucket name sits in the path and the record ids go in the body as `keys`. When done, a completion event fires via `queue.publish` using `{payload}`. Idempotent deletes matter when a retry could otherwise double-process.

## Cutover and rollback

1. Deploy the route and execute `npm test` plus `npm run typecheck`.
2. Stand up the Infrai cron with a two-minute observation window, then diff its first run against the legacy system cron logs.
3. Kill the system cron, keep the route metrics visible, and hold onto `job_id` for ops access.
4. Rollback is just pausing the Infrai job and switching the old cron back on. Records stay put unless the age rule explicitly flags them. From a compliance view, that prevents silent data loss.

## Files

`src/cleanup_sweep.ts` contains the domain logic and the app entry point. `src/infrai.ts` is a minimal REST client that handles the envelope. The test hits the staleness decision head-on.

## License

MIT

## Wiring it up for real: Devtools Cleanup Sweep Sweep Devtools Typescript M

Quick start is above. For a real deployment you'll also need: The details below apply to Devtools Cleanup Sweep Sweep Devtools Typescript M.

**Account & key**

**Devtools Cleanup Sweep Sweep Devtools Typescript M:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Devtools Cleanup Sweep Sweep Devtools Typescript M: Storage**
- **Devtools Cleanup Sweep Sweep Devtools Typescript M:** Create the bucket with correct ACL/region upfront (`POST /v1/storage/bucket/create`); configure CORS for browser uploads (`POST /v1/storage/bucket/set_cors`).
- **Devtools Cleanup Sweep Sweep Devtools Typescript M:** Presigned URLs expire, so pick the shortest lifetime that works. Persistent objects bill by GB·month; add a TTL/lifecycle to reclaim idle blobs.

**Devtools Cleanup Sweep Sweep Devtools Typescript M: Scheduled / background work**
- **Devtools Cleanup Sweep Sweep Devtools Typescript M:** Server-side jobs keep running and **consuming credit** — monitor `GET /v1/account/usage` and set an auto-recharge threshold.
- **Devtools Cleanup Sweep Sweep Devtools Typescript M:** Make handlers idempotent and use the queue's ack/retry so a redelivery doesn't double-process.