import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  loadArticle,
  renderArticleContent,
  resolveCoverPath,
  toDraftArticle,
} from "../src/article.js";

test("读取 front matter 并渲染公众号内联样式", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "wechat-article-"));
  const cover = path.join(directory, "cover.png");
  const source = path.join(directory, "article.md");
  await writeFile(cover, Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  await writeFile(source, `---
title: 测试文章
author: 测试作者
cover: ./cover.png
---

## 小标题

正文 **加粗**。

![图片](./cover.png)
`);

  const article = await loadArticle(source);
  const html = await renderArticleContent(article);

  assert.equal(article.metadata.title, "测试文章");
  assert.equal(resolveCoverPath(article), cover);
  assert.match(html, /border-left: 4px solid #07c160/);
  assert.match(html, /<strong>加粗<\/strong>/);
  assert.match(html, /src="file:\/\//);
});

test("生成微信草稿字段", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "wechat-draft-"));
  const source = path.join(directory, "article.md");
  await writeFile(source, `---
title: 标题
cover: cover.png
show_cover_pic: true
need_open_comment: true
---

正文
`);
  const article = await loadArticle(source);
  const draft = toDraftArticle(article, "<p>正文</p>", "thumb-123");

  assert.deepEqual(
    {
      title: draft.title,
      thumb_media_id: draft.thumb_media_id,
      show_cover_pic: draft.show_cover_pic,
      need_open_comment: draft.need_open_comment,
      only_fans_can_comment: draft.only_fans_can_comment,
    },
    {
      title: "标题",
      thumb_media_id: "thumb-123",
      show_cover_pic: 1,
      need_open_comment: 1,
      only_fans_can_comment: 0,
    },
  );
});
