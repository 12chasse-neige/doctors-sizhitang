# 微信服务号内容工具

这是一个本地运行的微信服务号内容工作流：用 Markdown 写文章，在浏览器中预览排版，上传正文图片和封面，创建微信草稿，最后在明确确认后提交发布。

项目直接调用微信官方接口，不把 `AppSecret` 交给第三方服务。令牌会缓存在 `.cache/`，真实密钥只放在 `.env`，两者都已加入 `.gitignore`。

## 已配置的能力

- Markdown 转公众号内联样式 HTML
- 本地正文图片自动上传并替换为微信图片 URL
- 封面上传为永久图片素材
- 新建草稿、列出草稿
- 提交发布任务、查询发布状态
- 稳定版 `access_token` 获取、本地缓存和失效后自动刷新
- 本地类型检查与离线测试

对应微信官方接口文档：

- [获取稳定版接口调用凭据](https://developers.weixin.qq.com/doc/offiaccount/Basic_Information/getStableAccessToken.html)
- [上传图文消息内的图片](https://developers.weixin.qq.com/doc/offiaccount/Asset_Management/Adding_Permanent_Assets.html)
- [新建草稿](https://developers.weixin.qq.com/doc/offiaccount/Draft_Box/Add_draft.html)
- [发布能力](https://developers.weixin.qq.com/doc/offiaccount/Publish/Publish.html)

## 1. 配置微信公众平台

先登录[微信公众平台](https://mp.weixin.qq.com/)，在“设置与开发”中完成：

1. 确认该服务号已经取得草稿箱、素材管理和发布接口权限。
2. 在“基本配置”中取得服务号的 `AppID` 和 `AppSecret`。
3. 按平台要求配置调用服务器的 IP 白名单。若只在本机调用，需要公网出口 IP 稳定；生产环境建议部署到固定出口 IP 的服务器。
4. 不要把 `AppSecret` 发到聊天、文章、前端代码或版本库里。若已经泄露，应立即在公众平台重置。

复制本地配置：

```bash
cp .env.example .env
```

编辑 `.env`，只填写：

```dotenv
WECHAT_APP_ID=你的服务号AppID
WECHAT_APP_SECRET=你的服务号AppSecret
```

## 2. 写文章并预览

复制示例文章作为新稿件：

```bash
cp content/example.md content/my-article.md
npm run wechat -- preview --file content/my-article.md --out dist/my-article.html
```

Markdown 文件开头的字段含义：

```yaml
---
title: 文章标题
author: 作者或公众号名称
digest: 分享摘要
cover: ./cover.png
source_url: https://example.com/original
show_cover_pic: false
need_open_comment: false
only_fans_can_comment: false
---
```

封面和正文图片路径都相对于 Markdown 文件。接口上传支持 JPG、PNG、GIF、BMP；实际尺寸和文件大小仍需满足微信公众平台当时显示的限制。

## 3. 验证接口

只检查本地配置，不联网：

```bash
npm run wechat -- doctor
```

填写 `.env` 并配置 IP 白名单后，联网验证令牌和 API：

```bash
npm run wechat -- doctor --online
```

如果返回 `40164`，通常是当前公网出口 IP 不在公众号白名单。若返回接口权限相关错误，请在公众平台的“接口权限”页面确认账号类型、认证状态与权限。

## 4. 创建草稿

先做不联网的完整字段检查：

```bash
npm run wechat -- draft-create --file content/my-article.md --dry-run
```

确认后上传图片并创建真实微信草稿：

```bash
npm run wechat -- draft-create --file content/my-article.md
```

返回的 `media_id` 是草稿 ID。也可以列出最近草稿：

```bash
npm run wechat -- draft-list --count 10
```

## 5. 发布

发布属于真实外部操作，因此命令强制要求 `--confirm`：

```bash
npm run wechat -- publish --media-id "草稿media_id" --confirm
```

接口返回 `publish_id` 后查询状态：

```bash
npm run wechat -- publish-status --publish-id "发布任务publish_id"
```

建议先在微信公众平台后台打开草稿，人工检查手机预览、封面裁切、链接和错别字，再执行发布命令。

## 开发检查

```bash
npm run check
npm test
```

目前没有自动群发、定时发布、用户数据或消息回调逻辑。它们应在明确业务需求、权限范围和审核流程后再增加。
