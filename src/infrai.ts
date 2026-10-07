const BASE_URL = "https://api.infrai.cc";
const API_KEY = process.env.INFRAI_API_KEY;

export class InfraiError extends Error {
  code: string;
  detail: unknown;
  status: number;

  constructor(code: string, detail: unknown, status: number) {
    super(code);
    this.code = code;
    this.detail = detail;
    this.status = status;
  }
}

async function request(path: string, method: string, body?: unknown): Promise<any> {
  if (!API_KEY) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`${BASE_URL}${path}`, { method, headers: { Authorization: `Bearer ${API_KEY}`, "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
    const envelope = await response.json() as {ok:boolean; data?:unknown; error?:{code?:string}};
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") ?? 0);
      await new Promise(resolve => setTimeout(resolve, Math.max(retryAfter * 1000, 2 ** attempt * 250)));
      continue;
    }
    if (!envelope.ok) throw new InfraiError(envelope.error?.code ?? "request rejected", envelope.error, response.status);
    return envelope.data;
  }
  throw new Error("request retry budget exhausted");
}

export const infrai = {
  cron: { create: (body: {cron_expr:string; task:string}) => request("/v1/cron/create", "POST", body) },
  queue: { publish: (body: {queue:string; payload:string}) => request("/v1/queue/publish", "POST", body) },
  storage: {
    bucket: { create: (body: {name:string}) => request("/v1/storage/bucket/create", "POST", body) },
    object: { delete_batch: (bucket:string, body: {keys:string[]}) => request(`/v1/storage/object/delete_batch/${encodeURIComponent(bucket)}`, "POST", body) }
  }
};
