# 来源与授权说明

## 当前项目

- 名称：AISaasGo 图片提示词库。
- 仓库：https://github.com/cf12436/gptimage_prompts
- 站点：https://image.aisaasgo.org
- AISaasGo / API origin：https://aisaasgo.org 。此地址仅标识服务来源，不构成任何接口路径、模型名称、认证方式、价格或免费额度的承诺。

## 上游来源

本项目的数据、案例提示词、风格分类和模板资料来自 [freestylefly/awesome-gpt-image-2](https://github.com/freestylefly/awesome-gpt-image-2)。迁移使用本地源仓库的实际快照：541 条案例、13 个分类和 22 个模板；案例编号不保证连续，最大编号 544 不代表有 544 条记录。

- `data/cases.json` 保留每条案例完整字段及内容，包括 `prompt`、`promptPreview`、`sourceLabel`、`sourceUrl`、`githubUrl`。其中 `githubUrl` 仍指向上游案例文档，属于来源链接，不是当前仓库元数据。
- `data/style-library.json` 保留分类、标签、模板、使用建议、注意事项和示例编号；`templateDocument` 指向上游模板原文。
- 两个数据文件的 `repository` 标识当前仓库，`upstreamRepository` 记录上游仓库。
- 上游图片原位于 `data/images/`，本项目迁移到 `public/images/`，保持文件名及二进制内容不变。仅保留案例与风格数据实际引用的 554 个文件，其中 541 个案例图片、13 个额外分类封面。未被引用的上游营销图片、微信群二维码与赞助素材不随本项目发布。
- `agents/skills/aisaasgo-image-prompts/` 为 AISaasGo 提示词选择与改写技能，工作流参考上游 `gpt-image-2-style-library`，自带相同的完整案例及风格数据。技能仅进行提示词处理，不调用图片生成服务。

## MIT 许可

根目录 `LICENSE` 原样保留上游 MIT 全文及 `Copyright (c) 2026 freestylefly`。技能目录也附带该许可，以便单独安装时保留声明。对本项目适用 MIT 的软件和文档进行复制或分发时，应保留版权及许可声明。

## 第三方素材与权利

MIT 软件许可不自动覆盖第三方图片、来源帖文、商标、人物肖像、参考照片以及其他第三方内容。本项目没有逐张确认图片再授权或商业使用权限，也不宣称这些素材是公有领域或可无条件商用。原始提示词的权利与来源声明同样应依实际权利人及原始许可判断。

案例的 `sourceLabel`、`sourceUrl` 和 `githubUrl` 是核查来源的入口。复用、转载、商用或将图片提交给生成工具前，请核实原始发布者的许可、平台条款及相关权利，必要时取得授权。可浏览的案例效果图不一定是当时使用的输入参考图，亦不证明拥有对该图的使用许可。

如权利人需要更正来源或提出移除请求，请通过 [当前仓库 Issues](https://github.com/cf12436/gptimage_prompts/issues) 提供案例编号、素材链接与权利说明。
