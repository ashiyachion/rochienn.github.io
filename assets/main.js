/* ==========================================================================
   ashiyachion.me — 互動腳本
   1. 深色模式的星空與流星
   2. 主題切換（記住訪客的選擇）
   3. 依時間打招呼、台北時鐘、依台北時間挑「正在循環」的歌
   4. 頁首背景、捲動淡入、導覽列標示目前區塊
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const THEME_COLOR = { light: '#f6f3ec', dark: '#0a0d1a' };

  const store = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* 私密瀏覽等情況存不了，忽略即可 */
      }
    },
  };

  const rand = (min, max) => min + Math.random() * (max - min);

  /* ---------- 1. 星空 ---------- */
  const sky = (() => {
    const canvas = document.querySelector('.sky');
    const ctx = canvas && canvas.getContext('2d');
    if (!ctx) return { toggle() {} };

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let meteors = [];
    let active = false;
    let rafId = 0;
    let last = 0;
    let nextMeteor = 0;

    function createStars() {
      const count = Math.round(Math.min(220, Math.max(70, (width * height) / 6500)));
      stars = Array.from({ length: count }, () => {
        const bright = Math.random() < 0.1;
        return {
          x: Math.random(),
          y: Math.random(),
          r: bright ? rand(1.1, 1.6) : rand(0.4, 1),
          alpha: rand(0.3, 0.85),
          speed: rand(0.0005, 0.002),
          phase: rand(0, Math.PI * 2),
          color: Math.random() < 0.18 ? '#ffe3b3' : '#e3e7ff',
        };
      });
    }

    // 星星的位置存成 0–1 的比例，視窗大小改變時不必重新產生
    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      if (w === width && h === height && ratio === dpr && stars.length) return;
      width = w;
      height = h;
      dpr = ratio;
      canvas.width = Math.round(w * ratio);
      canvas.height = Math.round(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (!stars.length) createStars();
    }

    function spawnMeteor() {
      const angle = rand(Math.PI * 0.7, Math.PI * 0.8); // 往左下方劃過
      meteors.push({
        x: rand(width * 0.3, width),
        y: rand(0, height * 0.3),
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        speed: rand(0.8, 1.3), // 每毫秒移動的像素
        length: rand(80, 160),
        age: 0,
        life: rand(700, 1100),
      });
    }

    function draw(time, dt) {
      ctx.clearRect(0, 0, width, height);

      for (const s of stars) {
        const twinkle = reduceMotion.matches ? 1 : 0.6 + 0.4 * Math.sin(time * s.speed + s.phase);
        ctx.globalAlpha = s.alpha * twinkle * (1 - s.y * 0.5); // 越靠近下方越淡
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.3;
      meteors = meteors.filter((m) => {
        m.age += dt;
        if (m.age >= m.life) return false;
        m.x += m.dx * m.speed * dt;
        m.y += m.dy * m.speed * dt;
        const t = m.age / m.life;
        const fade = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
        const tailX = m.x - m.dx * m.length;
        const tailY = m.y - m.dy * m.length;
        const gradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 243, 220, ${fade.toFixed(3)})`);
        gradient.addColorStop(1, 'rgba(255, 243, 220, 0)');
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        return true;
      });
    }

    function frame(time) {
      rafId = requestAnimationFrame(frame);
      const elapsed = time - last;
      if (elapsed < 33) return; // 約 30fps：夠順，也比較省電
      last = time;
      const dt = Math.min(elapsed, 100);
      nextMeteor -= dt;
      if (nextMeteor <= 0) {
        spawnMeteor();
        nextMeteor = rand(7000, 15000);
      }
      draw(time, dt);
    }

    function start() {
      cancelAnimationFrame(rafId);
      resize();
      if (reduceMotion.matches) {
        meteors = [];
        draw(0, 0); // 減少動態效果：只畫一次靜態星空
        return;
      }
      last = performance.now();
      if (nextMeteor <= 0) nextMeteor = rand(2500, 6000);
      rafId = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(rafId);
      rafId = 0;
      meteors = [];
    }

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!active) return;
        resize();
        draw(performance.now(), 0);
      }, 150);
    });

    reduceMotion.addEventListener('change', () => {
      if (active) start();
    });

    return {
      toggle(on) {
        if (on === active) return;
        active = on;
        if (on) start();
        else stop();
      },
    };
  })();

  /* ---------- 2. 主題 ---------- */
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', THEME_COLOR[theme]);
    if (themeToggle) {
      const label = theme === 'dark' ? '切換到淺色主題' : '切換到深色主題';
      themeToggle.setAttribute('aria-label', label);
      themeToggle.setAttribute('title', label);
    }
    sky.toggle(theme === 'dark');
  }

  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      store.set('theme', next);
      applyTheme(next);
    });
  }

  systemDark.addEventListener('change', (event) => {
    const saved = store.get('theme');
    if (saved === 'dark' || saved === 'light') return; // 訪客自己選過，就不跟著系統變
    applyTheme(event.matches ? 'dark' : 'light');
  });

  /* ---------- 3. 時間 ---------- */
  // 依「訪客自己」的時間打招呼
  const greeting = document.querySelector('[data-greeting]');
  if (greeting) {
    const hour = new Date().getHours();
    greeting.textContent =
      hour < 5 ? '夜深了' : hour < 11 ? '早安' : hour < 18 ? '午安' : hour < 23 ? '晚上好' : '夜深了';
  }

  // 台灣沒有夏令時間，固定是 UTC+8
  function taipeiTime() {
    const d = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const hour = d.getUTCHours();
    const minute = d.getUTCMinutes();
    return {
      hour,
      text: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    };
  }

  const clock = document.querySelector('[data-clock]');
  const tracks = Array.from(document.querySelectorAll('[data-track]'));
  const nowTitle = document.querySelector('[data-now-title]');
  const nowArtist = document.querySelector('[data-now-artist]');
  let shownHour = -1;

  // data-hours="22-6" 代表台北時間 22:00 到隔天 06:00
  function coversHour(spec, hour) {
    const [start, end] = String(spec || '').split('-').map(Number);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
    return start <= end ? hour >= start && hour < end : hour >= start || hour < end;
  }

  function pickTrack(hour) {
    if (!tracks.length) return;
    const playing = tracks.find((t) => coversHour(t.dataset.hours, hour)) || tracks[0];
    tracks.forEach((t) => {
      const isPlaying = t === playing;
      t.classList.toggle('is-playing', isPlaying);
      if (isPlaying) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
    const title = playing.querySelector('.track-title');
    const artist = playing.querySelector('.track-artist');
    if (nowTitle && title) nowTitle.textContent = title.textContent.trim();
    if (nowArtist && artist) nowArtist.textContent = artist.textContent.trim();
  }

  function tick() {
    const now = taipeiTime();
    if (clock) {
      clock.textContent = now.text;
      clock.hidden = false;
    }
    if (now.hour !== shownHour) {
      shownHour = now.hour;
      pickTrack(now.hour);
    }
  }

  tick();
  setInterval(tick, 10 * 1000);

  /* ---------- 4. 捲動 ---------- */
  // 往下捲之後，頁首加上半透明背景
  const header = document.querySelector('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // 區塊進入畫面時淡入
  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion.matches && revealItems.length) {
    root.classList.add('reveal-ready');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          revealObserver.unobserve(el);
          el.classList.add('is-visible');
          // 淡入結束後拿掉標記，卡片的 hover 效果才不會被影響
          el.addEventListener('transitionend', function done(event) {
            if (event.target !== el) return;
            el.removeEventListener('transitionend', done);
            el.removeAttribute('data-reveal');
            el.classList.remove('is-visible');
          });
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    );
    revealItems.forEach((el) => revealObserver.observe(el));
  }

  // 導覽列標示目前所在的區塊
  const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
  const linkFor = new Map();
  navLinks.forEach((link) => {
    const section = document.getElementById(link.getAttribute('href').slice(1));
    if (section) linkFor.set(section, link);
  });

  if ('IntersectionObserver' in window && linkFor.size) {
    const setActive = (active) => {
      navLinks.forEach((link) => {
        const on = link === active;
        link.classList.toggle('is-active', on);
        if (on) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const link = linkFor.get(entry.target);
          if (entry.isIntersecting) setActive(link);
          else if (link.classList.contains('is-active')) setActive(null);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    linkFor.forEach((_, section) => navObserver.observe(section));
  }

  // 頁尾年份
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
