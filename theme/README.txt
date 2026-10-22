theme文件说明

theme.css：正文排版、导航箭头、浅色/深色和手机布局。
theme.js：目录、导航折叠、代码复制、外观切换。本次仅移动，内容未改。
vendor：Docsify、搜索、语法高亮，以及许可证和来源说明，网站运行需要保留。
preview.cjs：预览服务器，已适配当前文件位置。

在项目根目录运行：
node theme/preview.cjs
然后打开 http://localhost:4173

根目录的 HOME.md、_sidebar.md、IMAGES.md、笔记目录和索引生成脚本保留原位。
生成导航与图片索引的使用方法不变。

index.html 中的路径已同步更新，不要只移动样式文件而漏掉vendor。
