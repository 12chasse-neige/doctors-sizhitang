import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { WechatClient } from "../src/wechat-client.js";

test("access_token 失效时强制刷新并重试一次", { concurrency: false }, async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "wechat-token-"));
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  let tokenRequests = 0;

  globalThis.fetch = async (input, init) => {
    const url = String(input);
    requests.push(url);
    if (url.endsWith("/cgi-bin/stable_token")) {
      tokenRequests += 1;
      const request = JSON.parse(String(init?.body)) as { force_refresh: boolean };
      assert.equal(request.force_refresh, tokenRequests === 2);
      return jsonResponse({ access_token: `token-${tokenRequests}`, expires_in: 7200 });
    }
    if (url.includes("access_token=token-1")) {
      return jsonResponse({ errcode: 40014, errmsg: "invalid access_token" });
    }
    return jsonResponse({ ip_list: ["203.0.113.1"] });
  };

  try {
    const client = new WechatClient({
      appId: "wx-test",
      appSecret: "secret-test",
      apiBase: "https://api.example.test",
      tokenCache: path.join(directory, "token.json"),
    });
    assert.deepEqual(await client.getApiDomainIps(), ["203.0.113.1"]);
    assert.equal(tokenRequests, 2);
    assert.equal(requests.filter((url) => url.includes("get_api_domain_ip")).length, 2);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
