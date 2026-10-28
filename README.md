# ashiya 的小站 (ashiyachion.me)

个人小站源码。纯静态 HTML / CSS / JS，无需构建，托管于 GitHub Pages。

## 目录结构

```text
ashiyachion-me/
├── index.html          # 页面结构
├── 404.html            # GitHub Pages 自动使用的 404 页面
├── CNAME               # 自定义域名 ashiyachion.me（不要删除）
├── .nojekyll           # 跳过 Jekyll 处理
└── assets/
    ├── favicon.svg
    ├── css/style.css   # 样式（浅色 / 深色主题变量在文件开头）
    └── js/
        ├── data.js     # 全部内容都在这里
        └── app.js      # 交互逻辑
```

## 上线前必须改的一项

打开 `assets/js/data.js`，把 `githubUser` 改成你真实的 GitHub 用户名：

```js
githubUser: "your-name",
```

原站链接的 `github.com/rochienn` 当前返回 404。`githubUser` 留空时，页面会自动隐藏所有 GitHub 按钮，不会出现坏链接。

`launchDate` 也请改成小站真实的上线日期，它用于计算“运行天数”。

## 更新内容

所有内容都在 `assets/js/data.js`，改完刷新即可：

| 想做的事 | 修改位置 |
| --- | --- |
| 改状态 / 标签 | `profile.statuses` / `profile.tags` |
| 换歌 | `playlist`（`link` 留空会自动生成网易云搜索链接） |
| 加项目 | `projects`（`repo` 填仓库地址后会显示“查看源码”） |
| 写随笔 | 在 `notes` 数组最前面加一项，`content` 支持 HTML |
| 记更新 | `changelog` |

随笔模板：

```js
{
  id: "my-new-post",          // 文章链接为 https://ashiyachion.me/#/note/my-new-post
  title: "标题",
  category: "日常与音乐",       // 出现两个及以上分类时，会自动显示分类筛选
  date: "2026-11-01",
  excerpt: "列表里显示的摘要",
  content: `<p>正文第一段</p><h3>小标题</h3><p>……</p>`
},
```

阅读时间会根据正文字数自动计算。

## 本地预览

```bash
python -m http.server 8080
```

浏览器打开 `http://localhost:8080`。

## 部署

在你现有的 Pages 仓库里覆盖文件即可，不要强制推送，以免丢失历史记录：

```bash
git clone https://github.com/<你的用户名>/<Pages仓库名>.git
# 把本目录下的文件复制进去（覆盖同名文件，保留 .git）
cd <Pages仓库名>
git add -A
git commit -m "改版：卡片布局、深色模式、项目与随笔"
git push
```

仓库 Settings -> Pages 中的 Source 保持 “Deploy from a branch” 即可，无需 GitHub Actions。
