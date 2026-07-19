import { chmod, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { WechatConfig } from "./config.js";

type JsonObject = Record<string, unknown>;

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

type WechatErrorBody = {
  errcode?: number;
  errmsg?: string;
};

const TOKEN_ERROR_CODES = new Set([40014, 42001, 42007]);

export class WechatApiError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = "WechatApiError";
  }
}

export class WechatClient {
  constructor(private readonly config: WechatConfig) {}

  async getAccessToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh) {
      const cached = await this.readTokenCache();
      if (cached && cached.expiresAt > Date.now() + 5 * 60_000) {
        return cached.accessToken;
      }
    }

    const response = await this.fetchJson<{
      access_token?: string;
      expires_in?: number;
    }>("/cgi-bin/stable_token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credential",
        appid: this.config.appId,
        secret: this.config.appSecret,
        force_refresh: forceRefresh,
      }),
    });
    assertWechatSuccess(response);

    if (!response.access_token || !response.expires_in) {
      throw new WechatApiError("微信接口没有返回有效 access_token", undefined, response);
    }

    const cache: TokenCache = {
      accessToken: response.access_token,
      expiresAt: Date.now() + response.expires_in * 1000,
    };
    await this.writeTokenCache(cache);
    return cache.accessToken;
  }

  async getApiDomainIps(): Promise<string[]> {
    const response = await this.authedJson<{ ip_list?: string[] }>(
      "/cgi-bin/get_api_domain_ip",
      () => ({ method: "GET" }),
    );
    return response.ip_list ?? [];
  }

  async uploadArticleImage(filePath: string): Promise<string> {
    const response = await this.authedJson<{ url?: string }>(
      "/cgi-bin/media/uploadimg",
      async () => ({
        method: "POST",
        body: await makeImageForm(filePath),
      }),
    );
    if (!response.url) {
      throw new WechatApiError("正文图片上传成功，但微信没有返回 URL", undefined, response);
    }
    return response.url;
  }

  async uploadPermanentImage(filePath: string): Promise<string> {
    const response = await this.authedJson<{ media_id?: string }>(
      "/cgi-bin/material/add_material?type=image",
      async () => ({
        method: "POST",
        body: await makeImageForm(filePath),
      }),
    );
    if (!response.media_id) {
      throw new WechatApiError("封面上传成功，但微信没有返回 media_id", undefined, response);
    }
    return response.media_id;
  }

  async addDraft(article: JsonObject): Promise<string> {
    const response = await this.authedJson<{ media_id?: string }>(
      "/cgi-bin/draft/add",
      () => jsonRequest({ articles: [article] }),
    );
    if (!response.media_id) {
      throw new WechatApiError("草稿创建成功，但微信没有返回 media_id", undefined, response);
    }
    return response.media_id;
  }

  async listDrafts(offset = 0, count = 20): Promise<unknown> {
    return this.authedJson("/cgi-bin/draft/batchget", () => jsonRequest({
      offset,
      count,
      no_content: 1,
    }));
  }

  async submitPublish(mediaId: string): Promise<string> {
    const response = await this.authedJson<{ publish_id?: string }>(
      "/cgi-bin/freepublish/submit",
      () => jsonRequest({ media_id: mediaId }),
    );
    if (!response.publish_id) {
      throw new WechatApiError("发布任务已提交，但微信没有返回 publish_id", undefined, response);
    }
    return response.publish_id;
  }

  async getPublishStatus(publishId: string): Promise<unknown> {
    return this.authedJson(
      "/cgi-bin/freepublish/get",
      () => jsonRequest({ publish_id: publishId }),
    );
  }

  private async authedJson<T = unknown>(
    pathname: string,
    initFactory: () => RequestInit | Promise<RequestInit>,
  ): Promise<T> {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const token = await this.getAccessToken(attempt === 1);
      const separator = pathname.includes("?") ? "&" : "?";
      const response = await this.fetchJson<T & WechatErrorBody>(
        `${pathname}${separator}access_token=${encodeURIComponent(token)}`,
        await initFactory(),
      );
      if (attempt === 0 && response.errcode && TOKEN_ERROR_CODES.has(response.errcode)) {
        continue;
      }
      assertWechatSuccess(response);
      return response;
    }
    throw new WechatApiError("微信 access_token 刷新后仍不可用");
  }

  private async fetchJson<T>(pathname: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.config.apiBase}${pathname}`, init);
    const text = await response.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new WechatApiError(
        `微信接口返回了非 JSON 内容（HTTP ${response.status}）`,
        undefined,
        text.slice(0, 500),
      );
    }
    if (!response.ok) {
      throw new WechatApiError(`微信接口 HTTP ${response.status}`, undefined, data);
    }
    return data as T;
  }

  private async readTokenCache(): Promise<TokenCache | undefined> {
    try {
      const parsed = JSON.parse(await readFile(this.config.tokenCache, "utf8")) as TokenCache;
      if (typeof parsed.accessToken === "string" && typeof parsed.expiresAt === "number") {
        return parsed;
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        // 缓存损坏时安全地重新获取，缓存本身不是业务真源。
      }
    }
    return undefined;
  }

  private async writeTokenCache(cache: TokenCache): Promise<void> {
    await mkdir(path.dirname(this.config.tokenCache), { recursive: true });
    const temporary = `${this.config.tokenCache}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(cache), { mode: 0o600 });
    await rename(temporary, this.config.tokenCache);
    await chmod(this.config.tokenCache, 0o600);
  }
}

function jsonRequest(body: JsonObject): RequestInit {
  return {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

function assertWechatSuccess(body: unknown): void {
  if (!body || typeof body !== "object") return;
  const { errcode, errmsg } = body as WechatErrorBody;
  if (typeof errcode === "number" && errcode !== 0) {
    throw new WechatApiError(`微信接口错误 ${errcode}: ${errmsg ?? "未知错误"}`, errcode, body);
  }
}

async function makeImageForm(filePath: string): Promise<FormData> {
  const absolute = path.resolve(filePath);
  const bytes = await readFile(absolute);
  const mime = imageMimeType(absolute);
  const form = new FormData();
  form.append("media", new Blob([bytes], { type: mime }), path.basename(absolute));
  return form;
}

function imageMimeType(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".bmp": "image/bmp",
  };
  const mime = types[extension];
  if (!mime) {
    throw new Error(`微信图片接口不支持该文件格式：${extension || "无扩展名"}`);
  }
  return mime;
}
