/* ==========================================================================
   ashiya 的小站 (ashiyachion.me) - 站点内容与配置数据中心
   说明：修改此文件即可更新个人状态、歌单、项目、随笔与更新日志。
   所有展示内容都来自这里，页面脚本不会再生成任何虚构数据。
   ========================================================================== */

window.SITE_DATA = {
  profile: {
    name: "ashiya",
    domain: "ashiyachion.me",
    // 请改成你真实的 GitHub 用户名。留空则页面会自动隐藏所有 GitHub 按钮。
    // 注意：原站链接的 github.com/rochienn 当前返回 404。
    githubUser: "",
    // 小站首版上线日期（用于计算运行天数），请按实际情况修改
    launchDate: "2026-10-26",
    tags: ["听歌", "虚拟偶像直播", "Python 自动化", "AI Bot 折腾", "Minecraft", "GitHub Pages"],
    statuses: [
      "正在听歌，顺便写一点 Python 脚本",
      "正在看虚拟偶像直播切片充电中",
      "正在折腾 AI Bot 与 Minecraft",
      "正在给小站写新的随笔"
    ]
  },

  // 最近单曲循环：link 留空时会自动生成网易云音乐搜索链接
  playlist: [
    {
      title: "群青",
      artist: "YOASOBI",
      mood: "写代码 · 鼓点驱动",
      note: "卡在奇怪的 Bug 里时，副歌一响就能找回节奏。",
      link: ""
    },
    {
      title: "花に亡霊",
      artist: "ヨルシカ",
      mood: "傍晚 · 放空",
      note: "干净的吉他前奏，适合写完东西之后单曲循环。",
      link: ""
    },
    {
      title: "踊り子",
      artist: "Vaundy",
      mood: "通勤 · 低频律动",
      note: "贝斯线很耐听，歌回里也经常能听到翻唱。",
      link: ""
    },
    {
      title: "ミラーチューン",
      artist: "ずっと真夜中でいいのに。",
      mood: "深夜 · 高密度",
      note: "节奏密集又不吵，适合需要专注推进的时候。",
      link: ""
    }
  ],

  skills: [
    {
      group: "脚本与数据",
      tone: "",
      items: ["Python", "pandas", "openpyxl", "YAML 配置", "pytest"]
    },
    {
      group: "Bot 与 AI",
      tone: "indigo",
      items: ["LLM Prompt", "OneBot v11", "NapCat", "Mineflayer", "MCP"]
    },
    {
      group: "前端与工具",
      tone: "emerald",
      items: ["HTML / CSS", "JavaScript", "Node.js", "Git", "Docker"]
    }
  ],

  vupRadar: {
    routine: [
      { title: "歌回与杂谈直播", badge: "常驻", desc: "写东西时的背景陪伴，偏爱弹唱和轻松的日常杂谈。" },
      { title: "联动与游戏企划", badge: "周末", desc: "周末补档，顺手记下好笑的名场面时间点。" }
    ],
    craft: [
      { title: "人设聊天 Bot", badge: "在做", desc: "用角色设定 + 大模型 + 记忆，让群聊 Bot 说话更像角色本人。" },
      { title: "MC 里的 AI 伙伴", badge: "实验", desc: "让带人设的 AI 进到模组服里一起采集、建造和聊天。" }
    ],
    clips: [
      { title: "清唱歌回精选", badge: "循环", desc: "安静耐听的日系流行与 Vocaloid 翻唱切片。" },
      { title: "游戏实况名场面", badge: "快乐", desc: "节目效果拉满的操作瞬间。" }
    ]
  },

  // status 请如实填写，例如：进行中 / 实验中 / 已完成 / 暂停
  // repo 填写仓库地址后会显示“查看源码”按钮，留空则不显示
  projects: [
    {
      id: "mindcraft-forge",
      title: "MC 模组服 AI 伙伴",
      category: "game-ai",
      categoryLabel: "AI 与游戏",
      status: "实验中",
      summary: "基于 Mindcraft / Mineflayer，让大模型驱动的 AI 角色进入 Forge 1.19.2 模组服。核心难点是 Forge 登录阶段的握手，目前通过一层代理来处理。",
      tech: ["Node.js", "Mineflayer", "Forge 1.19.2", "LLM"],
      diagram: "LLM + 人设  <->  Mineflayer 动作\n                    |\n             Forge 握手代理\n                    |\n          Forge 1.19.2 服务器",
      highlights: [
        "研究 Forge 1.19.2 登录阶段的握手流程，用代理转发并应答。",
        "把角色人设和游戏内动作（跟随、采集、建造）结合起来。",
        "提供 Docker 运行环境，方便拉起实例。"
      ],
      repo: ""
    },
    {
      id: "persona-bot",
      title: "人设群聊 Bot",
      category: "bot",
      categoryLabel: "AI 与 Bot",
      status: "进行中",
      summary: "基于 NapCat（OneBot v11）和大模型的群聊机器人，通过结构化人设文档和记忆模块，让回复更贴近角色语气，并记住群友的偏好。",
      tech: ["Python", "OneBot v11", "NapCat", "MCP"],
      diagram: "群消息 -> NapCat / OneBot\n              |\n      +-------+-------+\n      v               v\n   人设 Prompt     记忆模块\n      +-------+-------+\n              v\n          角色化回复",
      highlights: [
        "把性格、语癖、情绪边界拆成结构化的人设文档。",
        "用记忆模块记录群友的称呼和聊过的话题。",
        "调整触发阈值与冷却，避免刷屏。"
      ],
      repo: ""
    },
    {
      id: "pandas-etl",
      title: "表格流水线 Python 重构",
      category: "automation",
      categoryLabel: "自动化与数据",
      status: "已完成",
      summary: "把一套 Power Query（M 语言）的多表处理流程改写成 pandas + openpyxl 的模块化 Python 项目，支持按文件夹批量读取、关键词去重与类目映射。",
      tech: ["Python", "pandas", "openpyxl", "YAML", "pytest"],
      diagram: "config.yaml + 多个 Excel 文件夹\n              |\n   +----------+----------+\n   v          v          v\n 类目映射   关键词清洗   流水合并\n   +----------+----------+\n              v\n         DataFrame / Excel",
      highlights: [
        "用 config.yaml 管理路径，不再硬编码。",
        "每一步都是返回 DataFrame 的函数，方便单独测试。",
        "用 pytest 覆盖空值、重复键等边界情况。"
      ],
      repo: ""
    },
    {
      id: "this-site",
      title: "ashiyachion.me",
      category: "web",
      categoryLabel: "前端",
      status: "在线",
      summary: "你正在看的这个网站。纯静态 HTML / CSS / JS，无需构建，托管在 GitHub Pages，内容全部由一个数据文件驱动。",
      tech: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
      diagram: "data.js  ->  app.js 渲染\n                |\n   +------------+------------+\n   v            v            v\n 首页卡片     项目详情     随笔阅读",
      highlights: [
        "零构建，推送即上线。",
        "内容与界面分离，更新只改 data.js。",
        "深浅主题、Ctrl + K 搜索、可分享的文章链接。"
      ],
      repo: ""
    }
  ],

  // 随笔：新文章插到数组最前面即可。content 支持 HTML。
  notes: [
    {
      id: "hello-garden",
      title: "小站改版记录",
      category: "建站日志",
      date: "2026-10-28",
      excerpt: "ashiyachion.me 从一页两张卡片的静态页，改成了现在这个可以放项目和随笔的小站。记录一下改了什么、为什么这样做。",
      content: `
        <p>第一版只有二十几行 HTML：暖粉色背景、两张白色卡片。这次改版保留了原来的配色，把页面扩展成可以长期更新的个人小站。</p>
        <h3>这次改了什么</h3>
        <ul>
          <li>首页改成卡片网格：个人介绍、最近在听、技术栈、直播观测和更新日志。</li>
          <li>加入深色模式，会跟随系统设置，也可以手动切换。</li>
          <li>项目和随笔都有独立链接，可以直接分享某一篇。</li>
          <li>按 <code>Ctrl + K</code> 可以搜索全站内容。</li>
        </ul>
        <h3>为什么不用框架</h3>
        <p>内容量不大，纯静态文件推到 GitHub Pages 就能上线，不需要构建步骤，以后改起来也最省心。所有内容都放在 <code>assets/js/data.js</code> 里，写新文章只需要往数组里加一项。</p>
      `
    }
  ],

  // 更新日志：显示在首页卡片中，最新的放最前面
  changelog: [
    { date: "2026-10-28", text: "小站改版：卡片布局、深色模式、项目与随笔栏目" },
    { date: "2026-10-26", text: "第一版上线，绑定 ashiyachion.me 域名" }
  ]
};
