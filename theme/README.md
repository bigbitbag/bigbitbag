# 使用说明

## 日常更新

把 Markdown 放入任意分类文件夹，支持多层目录。提交并推送到 `main` 或 `master` 后，GitHub Actions 自动生成导航并部署。

首次使用：仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

- 文章第一行用 `# 标题`，作为导航名称；没有则使用文件名。
- 分类中的 `README.md` 可选，作为该分类介绍页。
- 图片和文档链接使用相对路径。
- 右侧自动生成标题目录；正文单独写一行 `[TOC]` 可插入目录。
- 空目录、只有图片的目录和配置中排除的目录不显示。

## 本地预览（可选）

在仓库根目录运行，无需第三方依赖：

```bash
python theme/tools/generate_index.py --serve
```

打开 http://localhost:4173 。笔记变化后自动更新索引，刷新网页即可；`Ctrl+C` 停止。只生成索引时去掉 `--serve`。

## 配置（按需）

- `config/site.json`：站点名称、简介、仓库链接、首页、默认主题与目录深度。
- `config/navigation.json`：分类名称、排序、隐藏规则及固定入口。

新增笔记不必修改配置。`generated/` 中的导航和图片索引由脚本生成，不要手动编辑；`vendor/` 中的依赖和许可证需要保留。
