# 计算机学习

这里整理计算机基础、操作系统、编程、网络和常用工具相关笔记。

## 现有笔记

- [Linux 笔记](computer/Linux.md)
- [Python 笔记](computer/Python.md)

## 建议的分类方式

可以按主题继续建立多级目录，例如：

```text
computer/
├── README.md
├── Linux.md
├── Python.md
├── networking/
│   ├── README.md
│   ├── TCP-IP.md
│   └── DNS.md
└── tools/
    ├── README.md
    └── Git.md
```

以上只是组织示例，不需要一次性创建所有目录。以后新建 Markdown 文件或子目录，运行导航生成脚本即可更新左侧目录。

图片建议放在对应主题附近的 `images/` 子目录中，并在笔记里用 Markdown 引用，例如：

```markdown
![网络拓扑示意图](computer/networking/images/topology.png)
```

如果笔记本身位于 `computer/networking/`，可以使用相对路径：

```markdown
![网络拓扑示意图](images/topology.png)
```
