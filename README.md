# 四之堂医生信息网站

面向手机与微信内置浏览器的静态中文医生信息网站，集中展示医生简介、擅长领域和金马、惠民、四之堂三处诊所的坐诊安排。

## 技术栈

- Vue 3 + TypeScript
- Vite
- 原生响应式 CSS（无 UI 框架、无后端、无外部 API）
- GitHub Actions + GitHub Pages

## 内容来源

`docs/materials/` 是原始资料的唯一事实来源：

- `docs/materials/doctors.md`：14 位医生的姓名、职称、简介和坐诊安排。
- `docs/materials/address.md`：金马、惠民、四之堂三处诊所的地址与联系电话。
- `docs/materials/portraits/`：与医生姓名对应的肖像。
- `docs/materials/appearances/`：四之堂诊所外观照片。
- `docs/materials/portraits/duty/`：原始排班截图，仅作为归档参考。

网页使用的规范化数据位于 `src/data/doctors.ts`，图片副本位于 `src/assets/`。原始材料不会被构建流程修改。

## 目录结构

```text
src/
├── assets/             # 网页使用的图片副本
├── components/         # 页面区块与医生资料卡
├── data/doctors.ts     # 结构化医生数据
├── styles/             # 全局样式与设计变量
├── App.vue
└── main.ts
.github/workflows/      # GitHub Pages 自动部署
docs/materials/         # 原始资料归档（事实来源）
```

## 本地开发

需要 Node.js 22.12 或更高版本。

```bash
npm install
npm run dev
```

Vite 会在终端显示本地访问地址。

## 检查与生产构建

```bash
npm run type-check
npm run build
npm run preview
```

生产文件会生成到 `dist/`，该目录不提交到 Git。

## GitHub Pages 部署

远端仓库是 `12chasse-neige/doctors-sizhitang`，属于普通项目站点，因此 Vite 的 `base` 已配置为 `/doctors-sizhitang/`。推送到 `main` 后，`.github/workflows/deploy.yml` 会安装依赖、构建并部署 `dist/`。

首次部署前需要在 GitHub 完成一次设置：

1. 打开仓库 `Settings`。
2. 进入 `Pages`。
3. 在 `Build and deployment` 下，将 `Source` 选择为 `GitHub Actions`。
4. 推送至 `main`，或在 `Actions` 页面手动运行 `Deploy to GitHub Pages`。
5. 在工作流完成后打开：`https://12chasse-neige.github.io/doctors-sizhitang/`。

## 更新医生信息

1. 先更新权威材料 `docs/materials/doctors.md`。
2. 同步修改 `src/data/doctors.ts` 中对应医生的数据。
3. 不要添加材料未明确提供的履历、荣誉、联系方式、地址或医疗主张。
4. 运行 `npm run type-check && npm run build`。

## 替换图片

1. 在 `docs/materials/` 中保存原始图片。
2. 将网页使用的副本放入 `src/assets/portraits/` 或 `src/assets/`。
3. 医生肖像文件名需与 `src/data/doctors.ts` 中的引用一致。
4. 保持竖版肖像比例，避免拉伸；较大图片应先生成适合网页的优化副本。

## 内容边界

诊所地址与电话按 `address.md` 呈现，坐诊安排按 `doctors.md` 呈现。现有材料没有提供二维码或线上预约链接，因此网站不展示这些内容；实际安排如有调整，以诊所或医院官方通知为准。
