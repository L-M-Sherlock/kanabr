# kanabr（静态优先）

<p align="center">
    <img src="assets/screenshot.png" alt="screenshot" width="600"/>
</p>

kanabr 是一个以 **日语假名（ひらがな / カタカナ）** 练习为中心的打字学习应用，
保留了 keybr 的自适应课程引擎：跟踪每个按键的统计、自动生成更针对薄弱按键的练习内容、
并用图表展示长期进步。

<p align="center">
    <img src="docs/assets/graph.png" alt="screenshot" width="600"/>
</p>

## 静态优先（推荐）

本仓库默认以“静态 SPA”方式使用：**无需云端数据库、无需自建服务端**，可直接部署到
Vercel / GitHub Pages / 任意静态站点。

静态模式下，用户进度保存在本机浏览器（IndexedDB / localStorage）。因此：
- 换浏览器/清除站点数据后会丢失进度（除非你先导出）
- 不支持账号登录、公榜、多人等依赖服务端的功能

> 需要服务端能力时仍可运行“服务端模式”（见后文）。

## 快速开始（静态模式）

```bash
npm install
```

构建静态产物（输出到 `vercel-dist/`）：

```bash
npm run build-vercel
```

本地预览静态站点（任选其一）：

```bash
npx serve vercel-dist
# 或
python3 -m http.server 3000 -d vercel-dist
```

然后打开终端提示的地址。

## 部署到 Vercel（静态模式）

Vercel 配置建议：
- Build Command: `npm run build-vercel`
- Output Directory: `vercel-dist`

可选构建期环境变量：
- `KEYBR_BASE_URL`（默认 `http://localhost:3000/`）
- `KEYBR_LOCALE`（默认 `en`）
- `KEYBR_COLOR`（默认 `system`）
- `KEYBR_FONT`（默认 `open-sans`）

## 本地数据：导入 / 导出

静态模式下进入 **Profile**：
- **Export data**：导出本地数据（打字历史 + 设置 + 偏好 + 主题）到 `keybr-local-data.json`
- **Import data**：导入 JSON 并覆盖当前本地数据（支持 `keybr-local-data.json`，也兼容旧的 `typing-data.json`）
- **Reset local data**：清空所有本地数据并恢复默认值

## 日语假名（罗马字输入）模式

1. Open the Practice page and click the settings button (gear icon).
2. Go to **Keyboard**:
   - `Language` → **Japanese**
   - `Layout` → **Japanese Romaji** (layout id: `ja-romaji`)
3. Go to **Lessons** (Guided lesson):
   - Optional: enable **Balance kana frequency**
   - Optional: adjust **Katakana ratio** (set to `0` for hiragana-only)
4. (Optional) In **Keyboard**, toggle **Show romaji helper** if you want to see
   suggested romaji spellings for the next kana.

## 开发模式（可选）

开发构建（webpack，`NODE_ENV=development`）：

```bash
npm run build-dev
```

持续构建：

```bash
npm run watch
```

## 服务端模式（可选）

如果你想要账号/登录、公开资料、公榜、多人等功能，需要运行服务端。

最简单方式是使用 sqlite（无需 MySQL）：

```bash
cp .env.example .env
npm start
```

> `.env.example` 默认 `DATABASE_CLIENT=sqlite`，数据库文件为 `DATABASE_FILENAME`。

## 测试

```bash
npm run test
```

## 贡献

- Bug / Feature：欢迎提 issue / PR
- 翻译：见 `docs/translations.md`

## License

Released under the GNU Affero General Public License v3.0.
