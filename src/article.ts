import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as cheerio from "cheerio";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";

const metadataSchema = z.object({
  title: z.string().trim().min(1, "文章缺少 title").max(128),
  author: z.string().trim().default(""),
  digest: z.string().trim().default(""),
  cover: z.string().trim().min(1, "文章缺少 cover"),
  source_url: z.string().url().or(z.literal("")).default(""),
  show_cover_pic: z.boolean().default(false),
  need_open_comment: z.boolean().default(false),
  only_fans_can_comment: z.boolean().default(false),
});

export type ArticleMetadata = z.infer<typeof metadataSchema>;

export type ArticleDocument = {
  sourcePath: string;
  markdown: string;
  metadata: ArticleMetadata;
};

export async function loadArticle(filePath: string): Promise<ArticleDocument> {
  const sourcePath = path.resolve(filePath);
  const source = await readFile(sourcePath, "utf8");
  const parsed = matter(source);
  return {
    sourcePath,
    markdown: parsed.content,
    metadata: metadataSchema.parse(parsed.data),
  };
}

export async function renderArticleContent(
  article: ArticleDocument,
  uploadImage?: (absolutePath: string) => Promise<string>,
): Promise<string> {
  const rawHtml = await marked.parse(article.markdown, { gfm: true, breaks: false });
  const $ = cheerio.load(rawHtml, null, false);
  applyWechatStyles($);

  const images = $("img").toArray();
  await Promise.all(images.map(async (image) => {
    const element = $(image);
    const source = element.attr("src");
    if (!source || isRemoteSource(source)) return;
    const absolute = path.resolve(path.dirname(article.sourcePath), source);
    await access(absolute);
    element.attr("src", uploadImage
      ? await uploadImage(absolute)
      : pathToFileURL(absolute).href);
  }));

  const html = $.root().html() ?? "";
  const byteLength = Buffer.byteLength(html, "utf8");
  if (byteLength > 1_000_000) {
    throw new Error(`正文 HTML 为 ${byteLength} 字节，超过微信接口 1 MB 限制`);
  }
  return html;
}

export function resolveCoverPath(article: ArticleDocument): string {
  return path.resolve(path.dirname(article.sourcePath), article.metadata.cover);
}

export function toDraftArticle(
  article: ArticleDocument,
  content: string,
  thumbMediaId: string,
): Record<string, unknown> {
  const metadata = article.metadata;
  return {
    title: metadata.title,
    author: metadata.author,
    digest: metadata.digest,
    content,
    content_source_url: metadata.source_url,
    thumb_media_id: thumbMediaId,
    show_cover_pic: metadata.show_cover_pic ? 1 : 0,
    need_open_comment: metadata.need_open_comment ? 1 : 0,
    only_fans_can_comment: metadata.only_fans_can_comment ? 1 : 0,
  };
}

export function makePreviewPage(article: ArticleDocument, content: string): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(article.metadata.title)}</title>
  <style>
    body { margin: 0; background: #f2f3f5; color: #222; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { box-sizing: border-box; max-width: 720px; min-height: 100vh; margin: 0 auto; padding: 28px 22px 60px; background: #fff; }
    .meta { margin-bottom: 26px; color: #8c8c8c; font-size: 14px; }
    .meta h1 { margin: 0 0 12px; color: #1a1a1a; font-size: 24px; line-height: 1.4; }
  </style>
</head>
<body>
  <main>
    <header class="meta"><h1>${escapeHtml(article.metadata.title)}</h1>${escapeHtml(article.metadata.author)}</header>
    <article>${content}</article>
  </main>
</body>
</html>`;
}

function applyWechatStyles($: cheerio.CheerioAPI): void {
  const styles: Record<string, string> = {
    "p": "margin: 1em 0; color: #333; font-size: 16px; line-height: 1.8; letter-spacing: 0.02em;",
    "h1": "margin: 1.6em 0 0.8em; color: #111; font-size: 24px; line-height: 1.4;",
    "h2": "margin: 1.5em 0 0.7em; padding-left: 10px; border-left: 4px solid #07c160; color: #111; font-size: 20px; line-height: 1.5;",
    "h3": "margin: 1.4em 0 0.6em; color: #111; font-size: 18px; line-height: 1.5;",
    "blockquote": "margin: 1.2em 0; padding: 10px 16px; border-left: 3px solid #d9d9d9; background: #f7f7f7; color: #666;",
    "ul, ol": "margin: 1em 0; padding-left: 1.5em; color: #333; font-size: 16px; line-height: 1.8;",
    "li": "margin: 0.35em 0;",
    "pre": "margin: 1.2em 0; padding: 14px; overflow-x: auto; border-radius: 6px; background: #f5f5f5; font-size: 13px; line-height: 1.6;",
    "code": "padding: 0.1em 0.3em; border-radius: 3px; background: #f5f5f5; color: #d14; font-family: Menlo, Consolas, monospace;",
    "a": "color: #576b95; text-decoration: none;",
    "img": "display: block; max-width: 100%; height: auto; margin: 1.2em auto;",
    "hr": "margin: 2em 0; border: 0; border-top: 1px solid #eee;",
  };
  for (const [selector, style] of Object.entries(styles)) {
    $(selector).each((_, element) => {
      const existing = $(element).attr("style") ?? "";
      $(element).attr("style", `${existing}${existing && !existing.endsWith(";") ? ";" : ""}${style}`);
    });
  }
}

function isRemoteSource(source: string): boolean {
  return /^(https?:|data:)/i.test(source);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}
