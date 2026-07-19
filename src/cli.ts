#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Command } from "commander";
import { ZodError } from "zod";
import {
  loadArticle,
  makePreviewPage,
  renderArticleContent,
  resolveCoverPath,
  toDraftArticle,
} from "./article.js";
import { getWechatConfig, inspectConfig } from "./config.js";
import { WechatApiError, WechatClient } from "./wechat-client.js";

const program = new Command();
program
  .name("wechat-content")
  .description("微信服务号内容预览、草稿创建与发布 CLI")
  .version("0.1.0");

program.command("doctor")
  .description("检查本地配置；加 --online 验证微信接口")
  .option("--online", "联网获取 access_token 并验证接口", false)
  .action(async ({ online }: { online: boolean }) => {
    const status = inspectConfig();
    console.log(`Node.js: ${process.version}`);
    console.log(`AppID: ${status.appIdConfigured ? "已配置" : "未配置"}`);
    console.log(`AppSecret: ${status.appSecretConfigured ? "已配置" : "未配置"}`);
    console.log(`API: ${status.apiBase}`);
    console.log(`令牌缓存: ${status.tokenCache}`);
    if (!online) return;
    const client = makeClient();
    await client.getAccessToken();
    const ips = await client.getApiDomainIps();
    console.log(`在线验证: 成功（微信 API 域名 IP 数量：${ips.length}）`);
  });

program.command("preview")
  .description("把 Markdown 渲染为本地 HTML 预览")
  .requiredOption("-f, --file <path>", "Markdown 文件")
  .option("-o, --out <path>", "输出 HTML", "dist/preview.html")
  .action(async ({ file, out }: { file: string; out: string }) => {
    const article = await loadArticle(file);
    const content = await renderArticleContent(article);
    const output = path.resolve(out);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, makePreviewPage(article, content), "utf8");
    console.log(`预览已生成：${output}`);
  });

program.command("draft-create")
  .description("上传封面和正文图片，并在微信草稿箱中创建草稿")
  .requiredOption("-f, --file <path>", "Markdown 文件")
  .option("--dry-run", "只验证和渲染，不调用微信接口", false)
  .action(async ({ file, dryRun }: { file: string; dryRun: boolean }) => {
    const article = await loadArticle(file);
    if (dryRun) {
      const content = await renderArticleContent(article);
      console.log(JSON.stringify(toDraftArticle(article, content, "DRY_RUN_THUMB_MEDIA_ID"), null, 2));
      return;
    }
    const client = makeClient();
    const content = await renderArticleContent(article, (image) => client.uploadArticleImage(image));
    const thumbMediaId = await client.uploadPermanentImage(resolveCoverPath(article));
    const mediaId = await client.addDraft(toDraftArticle(article, content, thumbMediaId));
    console.log(`微信草稿已创建，media_id：${mediaId}`);
  });

program.command("draft-list")
  .description("列出微信草稿箱条目（不下载正文）")
  .option("--offset <number>", "偏移量", "0")
  .option("--count <number>", "数量（1-20）", "20")
  .action(async ({ offset, count }: { offset: string; count: string }) => {
    const parsedOffset = parseInteger(offset, "offset", 0, Number.MAX_SAFE_INTEGER);
    const parsedCount = parseInteger(count, "count", 1, 20);
    console.log(JSON.stringify(await makeClient().listDrafts(parsedOffset, parsedCount), null, 2));
  });

program.command("publish")
  .description("提交微信草稿发布任务；必须显式传入 --confirm")
  .requiredOption("--media-id <id>", "草稿 media_id")
  .option("--confirm", "确认这次真实发布", false)
  .action(async ({ mediaId, confirm }: { mediaId: string; confirm: boolean }) => {
    if (!confirm) {
      throw new Error("未发布：请确认草稿无误后补充 --confirm");
    }
    const publishId = await makeClient().submitPublish(mediaId);
    console.log(`发布任务已提交，publish_id：${publishId}`);
  });

program.command("publish-status")
  .description("查询发布任务状态")
  .requiredOption("--publish-id <id>", "发布任务 publish_id")
  .action(async ({ publishId }: { publishId: string }) => {
    console.log(JSON.stringify(await makeClient().getPublishStatus(publishId), null, 2));
  });

program.parseAsync().catch((error: unknown) => {
  if (error instanceof ZodError) {
    console.error(error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n"));
  } else if (error instanceof WechatApiError) {
    console.error(error.message);
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }
  process.exitCode = 1;
});

function makeClient(): WechatClient {
  return new WechatClient(getWechatConfig());
}

function parseInteger(value: string, name: string, minimum: number, maximum: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} 必须是 ${minimum} 到 ${maximum} 之间的整数`);
  }
  return parsed;
}
