/* ==========================================================================
   ashiya 的小站 (ashiyachion.me) - 交互控制器
   ========================================================================== */

(function () {
  "use strict";

  const data = window.SITE_DATA;
  if (!data) return;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const githubUrl = data.profile.githubUser
    ? `https://github.com/${encodeURIComponent(data.profile.githubUser)}`
    : "";

  const state = {
    statusIndex: 0,
    trackIndex: 0,
    vupTab: "routine",
    projectFilter: "all",
    noteFilter: "all",
    cmdIndex: 0,
    cmdMatches: [],
    lastFocus: null
  };

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  const ARROW_ICON =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';

  // ==========================================================================
  // 主题：初始值已由 <head> 内联脚本设置，这里只负责切换与同步
  // ==========================================================================
  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  function applyTheme(theme, persist) {
    document.documentElement.setAttribute("data-theme", theme);
    if (persist) {
      try {
        localStorage.setItem("ashiya_theme", theme);
      } catch (e) {
        /* 隐私模式下可能无法写入，忽略 */
      }
    }
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#120f16" : "#fff9fa");
    const btn = $("#theme-toggle-btn");
    if (btn) btn.setAttribute("aria-pressed", String(theme === "dark"));
  }

  function toggleTheme() {
    applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
  }

  function initTheme() {
    applyTheme(currentTheme(), false);
    const btn = $("#theme-toggle-btn");
    if (btn) btn.addEventListener("click", toggleTheme);

    // 用户未手动选择时跟随系统切换
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (mq && mq.addEventListener) {
      mq.addEventListener("change", (e) => {
        let saved = null;
        try {
          saved = localStorage.getItem("ashiya_theme");
        } catch (err) {
          saved = null;
        }
        if (!saved) applyTheme(e.matches ? "dark" : "light", false);
      });
    }
  }

  // ==========================================================================
  // GitHub 链接：未配置用户名时隐藏，避免出现 404 链接
  // ==========================================================================
  function initGithubLinks() {
    $$("[data-github-link]").forEach((el) => {
      if (githubUrl) {
        el.setAttribute("href", githubUrl);
        el.hidden = false;
      } else {
        el.hidden = true;
      }
    });
  }

  // ==========================================================================
  // 个人名片
  // ==========================================================================
  function initHero() {
    const tags = $("#hero-tags");
    if (tags) {
      tags.innerHTML = data.profile.tags
        .map((t) => `<li class="tag-chip">${escapeHtml(t)}</li>`)
        .join("");
    }

    const pill = $("#status-switcher");
    const text = $("#status-text");
    const statuses = data.profile.statuses || [];
    if (!pill || !text || statuses.length === 0) return;

    text.textContent = statuses[0];
    pill.addEventListener("click", () => {
      state.statusIndex = (state.statusIndex + 1) % statuses.length;
      text.classList.add("is-fading");
      setTimeout(() => {
        text.textContent = statuses[state.statusIndex];
        text.classList.remove("is-fading");
      }, 150);
    });
  }

  // ==========================================================================
  // 最近在听：只展示歌曲与推荐语，点击“去听”跳转外部平台
  // ==========================================================================
  function trackLink(track) {
    if (track.link) return track.link;
    const q = encodeURIComponent(`${track.title} ${track.artist}`);
    return `https://music.163.com/#/search/m/?s=${q}&type=1`;
  }

  function renderMusic() {
    const track = data.playlist[state.trackIndex];
    if (!track) return;

    $("#track-mood").textContent = track.mood;
    $("#track-title").textContent = track.title;
    $("#track-artist").textContent = track.artist;
    $("#track-note").textContent = track.note;
    $("#track-listen").setAttribute("href", trackLink(track));

    const disc = $("#vinyl-disc");
    if (disc) {
      disc.classList.remove("is-switching");
      // 强制重排以重新触发动画
      void disc.offsetWidth;
      disc.classList.add("is-switching");
    }

    $$(".mini-track-item").forEach((el, idx) => {
      const active = idx === state.trackIndex;
      el.classList.toggle("active", active);
      el.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function selectTrack(idx) {
    const n = data.playlist.length;
    state.trackIndex = ((idx % n) + n) % n;
    renderMusic();
  }

  function initMusic() {
    const list = $("#mini-playlist");
    if (!list || data.playlist.length === 0) return;

    list.innerHTML = data.playlist
      .map(
        (t, idx) => `
        <li>
          <button type="button" class="mini-track-item" data-track-idx="${idx}">
            <span class="mini-track-index mono">${String(idx + 1).padStart(2, "0")}</span>
            <span class="mini-track-name">${escapeHtml(t.title)}</span>
            <span class="mini-track-artist">${escapeHtml(t.artist)}</span>
          </button>
        </li>`
      )
      .join("");

    list.addEventListener("click", (e) => {
      const btn = e.target.closest(".mini-track-item");
      if (btn) selectTrack(parseInt(btn.getAttribute("data-track-idx"), 10));
    });

    const prev = $("#btn-prev-track");
    const next = $("#btn-next-track");
    if (prev) prev.addEventListener("click", () => selectTrack(state.trackIndex - 1));
    if (next) next.addEventListener("click", () => selectTrack(state.trackIndex + 1));

    renderMusic();
  }

  // ==========================================================================
  // 技术栈 / 直播观测 / 小站日志
  // ==========================================================================
  function initSkills() {
    const box = $("#skills-matrix");
    if (!box) return;
    box.innerHTML = data.skills
      .map(
        (g) => `
        <div>
          <div class="skill-group-title">${escapeHtml(g.group)}</div>
          <ul class="skill-pills">
            ${g.items
              .map(
                (item) =>
                  `<li class="skill-pill"><span class="skill-dot ${escapeHtml(g.tone)}"></span>${escapeHtml(item)}</li>`
              )
              .join("")}
          </ul>
        </div>`
      )
      .join("");
  }

  function renderVup() {
    const panel = $("#vup-panel-content");
    if (!panel) return;
    const list = data.vupRadar[state.vupTab] || [];
    panel.innerHTML = list
      .map(
        (item) => `
        <div class="vup-item">
          <div class="vup-item-top">
            <span>${escapeHtml(item.title)}</span>
            <span class="vup-badge">${escapeHtml(item.badge)}</span>
          </div>
          <div class="vup-item-desc">${escapeHtml(item.desc)}</div>
        </div>`
      )
      .join("");
  }

  function initVup() {
    const tabs = $$(".vup-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activateVupTab(tab, tabs));
      tab.addEventListener("keydown", (e) => {
        const i = tabs.indexOf(tab);
        let target = null;
        if (e.key === "ArrowRight") target = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") target = tabs[(i - 1 + tabs.length) % tabs.length];
        if (target) {
          e.preventDefault();
          activateVupTab(target, tabs);
          target.focus();
        }
      });
    });
    renderVup();
  }

  function activateVupTab(tab, tabs) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    state.vupTab = tab.getAttribute("data-vup-tab");
    renderVup();
  }

  function initSiteLog() {
    const launch = new Date(`${data.profile.launchDate}T00:00:00`);
    const days = Math.max(1, Math.floor((Date.now() - launch.getTime()) / 86400000) + 1);
    const set = (id, v) => {
      const el = $(id);
      if (el) el.textContent = v;
    };
    set("#stat-days", String(days));
    set("#stat-projects", String(data.projects.length));
    set("#stat-notes", String(data.notes.length));

    const log = $("#changelog-list");
    if (log) {
      log.innerHTML = (data.changelog || [])
        .slice(0, 4)
        .map(
          (item) => `
          <li class="changelog-item">
            <time class="changelog-date mono" datetime="${escapeHtml(item.date)}">${escapeHtml(item.date.slice(5))}</time>
            <span>${escapeHtml(item.text)}</span>
          </li>`
        )
        .join("");
    }
  }

  // ==========================================================================
  // 项目与随笔列表
  // ==========================================================================
  function renderProjects() {
    const grid = $("#projects-grid");
    if (!grid) return;
    const list =
      state.projectFilter === "all"
        ? data.projects
        : data.projects.filter((p) => p.category === state.projectFilter);

    grid.innerHTML = list
      .map(
        (p) => `
        <article class="project-card">
          <div>
            <div class="project-top">
              <span class="project-category-badge">${escapeHtml(p.categoryLabel)}</span>
              <span class="project-status">${escapeHtml(p.status)}</span>
            </div>
            <h3 class="project-title">${escapeHtml(p.title)}</h3>
            <p class="project-summary">${escapeHtml(p.summary)}</p>
          </div>
          <div class="project-footer">
            <ul class="project-tech-list">
              ${p.tech.map((t) => `<li class="tech-badge mono">${escapeHtml(t)}</li>`).join("")}
            </ul>
            <a class="project-detail-trigger" href="#/project/${encodeURIComponent(p.id)}">
              <span>查看详情</span>${ARROW_ICON}
            </a>
          </div>
        </article>`
      )
      .join("");
  }

  function renderNotes() {
    const grid = $("#notes-grid");
    if (!grid) return;
    const list =
      state.noteFilter === "all"
        ? data.notes
        : data.notes.filter((n) => n.category === state.noteFilter);

    if (list.length === 0) {
      grid.innerHTML = `<p class="empty-hint">这个分类下还没有文章，敬请期待。</p>`;
      return;
    }

    grid.innerHTML = list
      .map(
        (n) => `
        <article class="note-card">
          <div>
            <div class="note-meta-top">
              <span class="note-category">${escapeHtml(n.category)}</span>
              <time class="mono" datetime="${escapeHtml(n.date)}">${escapeHtml(n.date)}</time>
              <span aria-hidden="true">·</span>
              <span>${readTime(n.content)}</span>
            </div>
            <h3 class="note-title">
              <a href="#/note/${encodeURIComponent(n.id)}" class="stretched-link">${escapeHtml(n.title)}</a>
            </h3>
            <p class="note-excerpt">${escapeHtml(n.excerpt)}</p>
          </div>
          <div class="note-footer">
            <span>随笔</span>
            <span class="note-read-more">阅读全文 ${ARROW_ICON}</span>
          </div>
        </article>`
      )
      .join("");
  }

  // 根据正文字数估算阅读时间（中文约 400 字 / 分钟）
  function readTime(html) {
    const text = String(html || "").replace(/<[^>]+>/g, "").replace(/\s+/g, "");
    return `约 ${Math.max(1, Math.round(text.length / 400))} 分钟`;
  }

  function buildFilterBar(containerId, values, current, onChange) {
    const bar = $(containerId);
    if (!bar) return;
    bar.innerHTML = values
      .map(
        (v) =>
          `<button type="button" class="filter-btn${v.value === current ? " active" : ""}" data-value="${escapeHtml(v.value)}" aria-pressed="${v.value === current}">${escapeHtml(v.label)}</button>`
      )
      .join("");
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      $$(".filter-btn", bar).forEach((b) => {
        const on = b === btn;
        b.classList.toggle("active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      onChange(btn.getAttribute("data-value"));
    });
  }

  function uniqueBy(list, key, labelKey) {
    const seen = new Map();
    list.forEach((item) => {
      if (!seen.has(item[key])) seen.set(item[key], item[labelKey || key]);
    });
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }

  function initProjects() {
    const cats = uniqueBy(data.projects, "category", "categoryLabel");
    buildFilterBar("#project-filters", [{ value: "all", label: "全部" }, ...cats], "all", (v) => {
      state.projectFilter = v;
      renderProjects();
    });
    renderProjects();
  }

  function initNotes() {
    const cats = uniqueBy(data.notes, "category");
    // 只有一个分类时不显示过滤器
    if (cats.length > 1) {
      buildFilterBar("#note-filters", [{ value: "all", label: "全部" }, ...cats], "all", (v) => {
        state.noteFilter = v;
        renderNotes();
      });
    }
    renderNotes();
  }

  // ==========================================================================
  // 弹窗：焦点管理 + Tab 循环 + Esc 关闭
  // ==========================================================================
  const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

  function openOverlay(overlay, focusTarget) {
    if (!overlay) return;
    if (!overlay.classList.contains("is-open")) {
      state.lastFocus = document.activeElement;
    }
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    setTimeout(() => (focusTarget || $(FOCUSABLE, overlay))?.focus(), 30);
  }

  function closeOverlay(overlay) {
    if (!overlay || !overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    if (!$(".modal-overlay.is-open")) document.body.classList.remove("no-scroll");
    if (state.lastFocus && document.contains(state.lastFocus)) state.lastFocus.focus();
  }

  function trapFocus(e) {
    const overlay = $(".modal-overlay.is-open");
    if (!overlay || e.key !== "Tab") return;
    const items = $$(FOCUSABLE, overlay).filter((el) => el.offsetParent !== null);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ==========================================================================
  // 阅读器：基于 hash 路由（#/note/id、#/project/id），支持分享与浏览器后退
  // ==========================================================================
  const reader = $("#reader-modal");
  const SITE_TITLE = document.title;

  function fillReader(badge, meta, title, html) {
    $("#modal-badge").textContent = badge;
    $("#modal-submeta").textContent = meta;
    $("#modal-title").textContent = title;
    $("#modal-content").innerHTML = html;
    $(".modal-body", reader).scrollTop = 0;
    document.title = `${title} | ashiya 的小站`;
  }

  function showNote(id) {
    const n = data.notes.find((x) => x.id === id);
    if (!n) return false;
    fillReader(n.category, `${n.date} · ${readTime(n.content)}`, n.title, n.content);
    return true;
  }

  function showProject(id) {
    const p = data.projects.find((x) => x.id === id);
    if (!p) return false;
    const repo = p.repo
      ? `<p><a class="btn btn-secondary" href="${escapeHtml(p.repo)}" target="_blank" rel="noopener noreferrer">查看源码</a></p>`
      : "";
    fillReader(
      p.categoryLabel,
      `状态：${p.status}`,
      p.title,
      `
      <p>${escapeHtml(p.summary)}</p>
      <h3>结构示意</h3>
      <pre><code>${escapeHtml(p.diagram)}</code></pre>
      <h3>要点</h3>
      <ul>${p.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>
      <h3>技术栈</h3>
      <ul class="project-tech-list">${p.tech.map((t) => `<li class="tech-badge mono">${escapeHtml(t)}</li>`).join("")}</ul>
      ${repo}`
    );
    return true;
  }

  function handleRoute() {
    const m = location.hash.match(/^#\/(note|project)\/(.+)$/);
    if (m) {
      const id = decodeURIComponent(m[2]);
      const ok = m[1] === "note" ? showNote(id) : showProject(id);
      if (ok) {
        openOverlay(reader, $("#modal-close-btn"));
        return;
      }
    }
    if (reader.classList.contains("is-open")) {
      closeOverlay(reader);
      document.title = SITE_TITLE;
    }
  }

  function closeReader() {
    if (/^#\/(note|project)\//.test(location.hash)) {
      // 清除 hash 而不跳回页面顶部
      history.pushState("", document.title, location.pathname + location.search);
    }
    closeOverlay(reader);
    document.title = SITE_TITLE;
  }

  function initReader() {
    $("#modal-close-btn").addEventListener("click", closeReader);
    reader.addEventListener("click", (e) => {
      if (e.target === reader) closeReader();
    });
    window.addEventListener("hashchange", handleRoute);
    window.addEventListener("popstate", handleRoute);
    handleRoute();
  }

  // ==========================================================================
  // 命令面板：Ctrl/Cmd + K，支持上下键选择与回车执行
  // ==========================================================================
  const cmd = $("#cmd-modal");
  const cmdInput = $("#cmd-input");
  const cmdResults = $("#cmd-results");

  function go(hash) {
    closeOverlay(cmd);
    location.hash = hash;
  }

  function commandItems() {
    const items = [
      { title: "首页概览", sub: "跳转到页面顶部", type: "导航", run: () => go("#overview") },
      { title: "项目", sub: "跳转到项目区", type: "导航", run: () => go("#projects") },
      { title: "随笔", sub: "跳转到随笔区", type: "导航", run: () => go("#notes") }
    ];
    data.notes.forEach((n) =>
      items.push({ title: n.title, sub: `随笔 · ${n.category}`, type: "文章", run: () => go(`#/note/${n.id}`) })
    );
    data.projects.forEach((p) =>
      items.push({ title: p.title, sub: p.tech.join(" / "), type: "项目", run: () => go(`#/project/${p.id}`) })
    );
    data.playlist.forEach((t, idx) =>
      items.push({
        title: `${t.title} - ${t.artist}`,
        sub: t.mood,
        type: "歌曲",
        run: () => {
          closeOverlay(cmd);
          selectTrack(idx);
          $("#music-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      })
    );
    items.push({
      title: "切换深色 / 浅色主题",
      sub: "偏好会保存在本地",
      type: "操作",
      run: () => {
        closeOverlay(cmd);
        toggleTheme();
      }
    });
    if (githubUrl) {
      items.push({
        title: "打开 GitHub 主页",
        sub: githubUrl,
        type: "链接",
        run: () => {
          closeOverlay(cmd);
          window.open(githubUrl, "_blank", "noopener");
        }
      });
    }
    return items;
  }

  function renderCmd() {
    const q = cmdInput.value.trim().toLowerCase();
    const all = commandItems();
    state.cmdMatches = q
      ? all.filter((it) => `${it.title} ${it.sub} ${it.type}`.toLowerCase().includes(q))
      : all;
    state.cmdIndex = Math.min(state.cmdIndex, Math.max(0, state.cmdMatches.length - 1));

    if (state.cmdMatches.length === 0) {
      cmdResults.innerHTML = `<li class="cmd-empty">没有找到相关内容</li>`;
      cmdInput.removeAttribute("aria-activedescendant");
      return;
    }

    cmdResults.innerHTML = state.cmdMatches
      .map(
        (it, idx) => `
        <li class="cmd-item${idx === state.cmdIndex ? " is-active" : ""}" id="cmd-opt-${idx}" role="option" aria-selected="${idx === state.cmdIndex}" data-idx="${idx}">
          <span class="cmd-item-left">
            <span class="cmd-item-title">${escapeHtml(it.title)}</span>
            <span class="cmd-item-sub">${escapeHtml(it.sub)}</span>
          </span>
          <span class="cmd-item-type">${escapeHtml(it.type)}</span>
        </li>`
      )
      .join("");
    cmdInput.setAttribute("aria-activedescendant", `cmd-opt-${state.cmdIndex}`);
    $(`#cmd-opt-${state.cmdIndex}`)?.scrollIntoView({ block: "nearest" });
  }

  function openCmd() {
    cmdInput.value = "";
    state.cmdIndex = 0;
    renderCmd();
    openOverlay(cmd, cmdInput);
  }

  function initCmd() {
    $("#cmd-trigger-btn").addEventListener("click", openCmd);
    cmd.addEventListener("click", (e) => {
      if (e.target === cmd) closeOverlay(cmd);
    });
    cmdInput.addEventListener("input", () => {
      state.cmdIndex = 0;
      renderCmd();
    });
    cmdInput.addEventListener("keydown", (e) => {
      const n = state.cmdMatches.length;
      if (e.key === "ArrowDown" && n) {
        e.preventDefault();
        state.cmdIndex = (state.cmdIndex + 1) % n;
        renderCmd();
      } else if (e.key === "ArrowUp" && n) {
        e.preventDefault();
        state.cmdIndex = (state.cmdIndex - 1 + n) % n;
        renderCmd();
      } else if (e.key === "Enter" && n) {
        e.preventDefault();
        state.cmdMatches[state.cmdIndex].run();
      }
    });
    cmdResults.addEventListener("click", (e) => {
      const li = e.target.closest(".cmd-item");
      if (li) state.cmdMatches[parseInt(li.getAttribute("data-idx"), 10)]?.run();
    });
    cmdResults.addEventListener("mousemove", (e) => {
      const li = e.target.closest(".cmd-item");
      if (!li) return;
      const idx = parseInt(li.getAttribute("data-idx"), 10);
      if (idx !== state.cmdIndex) {
        state.cmdIndex = idx;
        $$(".cmd-item", cmdResults).forEach((el, i) => {
          el.classList.toggle("is-active", i === idx);
          el.setAttribute("aria-selected", String(i === idx));
        });
        cmdInput.setAttribute("aria-activedescendant", `cmd-opt-${idx}`);
      }
    });
  }

  // ==========================================================================
  // 全局快捷键与导航高亮
  // ==========================================================================
  function initKeys() {
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        cmd.classList.contains("is-open") ? closeOverlay(cmd) : openCmd();
        return;
      }
      if (e.key === "Escape") {
        if (cmd.classList.contains("is-open")) closeOverlay(cmd);
        else if (reader.classList.contains("is-open")) closeReader();
        return;
      }
      trapFocus(e);
    });
  }

  function initScrollSpy() {
    const links = $$(".nav-link");
    const sections = links
      .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
      .filter(Boolean);
    if (!("IntersectionObserver" in window) || sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((a) => {
            const on = a.getAttribute("href") === `#${entry.target.id}`;
            a.classList.toggle("active", on);
            if (on) a.setAttribute("aria-current", "true");
            else a.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  function initFooter() {
    const y = $("#footer-year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  // 脚本位于 body 末尾，DOM 已就绪，直接初始化
  initTheme();
  initGithubLinks();
  initHero();
  initMusic();
  initSkills();
  initVup();
  initSiteLog();
  initProjects();
  initNotes();
  initReader();
  initCmd();
  initKeys();
  initScrollSpy();
  initFooter();
})();
