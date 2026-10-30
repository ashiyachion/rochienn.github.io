# ashiyachion.me

ashiya 的個人主頁。純手寫的 HTML、CSS 和一點 JavaScript：沒有框架、不用建置，推到 `main` 分支後由 GitHub Pages 自動上線。

## 檔案

```text
.
├── index.html        # 全部內容都在這裡：關於、作品、單曲循環、工具箱、聯絡
├── 404.html          # 找不到頁面時顯示（獨立檔案，不依賴其他樣式）
├── favicon.svg       # 網站圖示（月牙）
├── assets/
│   ├── style.css     # 樣式；顏色變數在檔案最上面
│   └── main.js       # 主題切換、台北時鐘、星空等小互動
├── CNAME             # 自訂網域 ashiyachion.me（不要刪）
└── .nojekyll         # 讓 GitHub Pages 直接發布檔案，不經過 Jekyll
```

## 怎麼改內容

- **文字**：直接改 `index.html`，每個區塊前面都有註解。
- **新增作品**：在「作品」區塊複製一整個 `<article class="card project">`，改掉文字。狀態標籤用這幾個 class：
  `status--active`（進行中）、`status--exp`（實驗中）、`status--done`（已完成）、`status--live`（上線中）。
- **換歌**：改「最近單曲循環」裡的 `<li class="track">`。`data-hours="22-6"` 代表台北時間 22:00 到隔天 06:00，
  頁首會顯示這首歌「正在循環」。
- **顏色**：改 `assets/style.css` 最上面的變數。`:root` 是淺色，`[data-theme="dark"]` 是深色。
- **公開信箱**：「聯絡」區塊裡有一段被註解掉的 Email 按鈕，拿掉註解、換成自己的信箱即可。

## 本機預覽

```bash
python3 -m http.server 8000
```

然後用瀏覽器打開 <http://localhost:8000>。
