<div align="center">

# dsh-claude-code-theme

**把 Claude Code 的视觉语言搬到 DeepSeek Harness Web GUI。**

暖纸质中性色、赤陶色强调色、`>` / `⏺` / `⎿` / `✻` 的对话标记语法，以及以等宽字体为主的排版 ——
全部通过 DSH 自身的主题扩展点生效，不修改它的样式表。

[![npm](https://img.shields.io/npm/v/dsh-claude-code-theme.svg)](https://www.npmjs.com/package/dsh-claude-code-theme)
[![license](https://img.shields.io/npm/l/dsh-claude-code-theme.svg)](./LICENSE)

<img src="./docs/assets/preview-dark.png" alt="深色会话中的主题效果" width="880">

<sub>深色。用户输入带 `>` 提示符，已完成的工具调用是绿色 `⏺`，其输出是 `⎿`，思考过程是赤陶色 `✻`。</sub>

<img src="./docs/assets/preview-light.png" alt="浅色会话中的主题效果" width="880">

<sub>浅色。Claude 的米白画布，配白色浮起卡片。</sub>

</div>

---

## 安装

```sh
dsh plugin install dsh-claude-code-theme
```

或者在你的 profile 的 `cordis.patch.yml` 中加入这一行，并把包名加进 profile 的
`dsh.profile.bundles`：

```yaml
- insert:
    - id: claude-code-theme
      name: dsh-claude-code-theme
```

刷新 Web GUI 即可。不需要手动切换：主题叠加在你当前的配色之上，因此 `light`、`dark`
和 `system` 三种偏好都照常可用。

## 改变了什么

**颜色。** DSH 的设计令牌分三层，主题对三层都做了处理：

| 层级 | 含义 | 主题的处理 |
| --- | --- | --- |
| `--dsw-static-*` | 原始色阶 | 把 DSH 偏蓝的灰阶换成 Claude 的暖纸质灰阶，把 DeepSeek 蓝换成赤陶色。语义层是通过这些色阶解析的，所以仅此一项就重新着色了大部分界面。 |
| `--dsw-alias-*` | 组件消费的语义角色 | 固定那些 Claude 有意与 DSH 不同的角色：白色卡片下的米白画布、赤陶色主按钮与焦点环、暖色细线。 |
| `--dsw-specific-*` | 具名表面 | 调整侧边栏、输入框、消息块、菜单与代码表面。 |

**对话标记语法。** Claude Code 的终端标记，通过伪元素挂在 DSH 公开的稳定
`data-*` 钩子上：

| 标记 | 节点 | 含义 |
| --- | --- | --- |
| `>` | `[data-chat-flow-kind="user"]` | 你的输入 |
| `⏺` | `[data-chat-flow-kind="assistant"]` | 助手发言 |
| `⏺` | `[data-chat-flow-kind="tool-call"]` | 已完成的工具调用 |
| `⎿` | `[data-chat-flow-kind="tool-result"]` | 该调用的输出 |
| `✻` | `[data-chat-flow-kind="reasoning"]` | 思考过程 |
| `✻` | `[data-chat-running]` | 运行中，标记缓慢旋转 |

**排版与几何。** 代码、工具输出与 diff 使用 Claude Code 的等宽字体栈；圆角收紧到
Claude 的 6 px；标题去掉 DSH 额外的字距；滚动条变为细暖色轨道。

## 自定义

组件层从 `body` 上的 `--cct-*` 变量读取字形、圆角与尺度。用自定义 CSS 覆盖其中任意一项，
无需 fork：

```css
body {
  /* 换一个提示符，并把留白调宽以匹配。 */
  --cct-marker-user: "❯";
  --cct-marker-gutter: 26px;

  /* 更方正，像终端那样。 */
  --cct-radius: 4px;
  --cct-radius-lg: 6px;

  /* 或者干脆去掉对话标记。 */
  --cct-marker-assistant: "";
  --cct-marker-tool: "";
}
```

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `--cct-marker-user` | `">"` | 你的消息上的提示符 |
| `--cct-marker-assistant` | `"●"` | 助手消息上的标记 |
| `--cct-marker-tool` | `"●"` | 工具调用上的标记 |
| `--cct-marker-result` | `"⎿"` | 工具输出上的标记 |
| `--cct-marker-reasoning` | `"✻"` | 思考过程与运行中状态上的标记 |
| `--cct-marker-gutter` | `22px` | 为标记预留的左侧留白 |
| `--cct-radius` | `6px` | 标准圆角 |
| `--cct-radius-sm` | `4px` | 紧凑圆角（行内代码） |
| `--cct-radius-lg` | `10px` | 宽松圆角 |
| `--cct-mono` | DSH 的代码字体栈 | 等宽字体 |

想改颜色，就再叠一层自己的覆盖 —— 后叠的层按令牌逐个生效：

```js
ctx.theme.overrideTokens('my-tweaks', {
  '--dsw-alias-brand-primary': { light: '#c96442', dark: '#d97757' },
})
```

## 实现方式

这个插件由一个浏览器端半体和一个不做事的宿主行组成。

浏览器端半体（`lib/client.js`）只做两件事，且都在同一个 Cordis effect 内，
因此卸载或 HMR 会完整移除主题：

1. 调用 `ctx.theme.overrideTokens('dsh-claude-code-theme', …)`，以
   `{ light, dark }` 成对的形式写入 168 个令牌。这是 DSH 官方文档化的第三方主题扩展点。
   服务会把该层叠加在当前配色之上，`ui-layout` 再把它写成 `<body>` 上的行内自定义属性 ——
   这正是主题无需 `!important` 就能压过基础配色表的原因，也是覆盖
   `--dsw-static-*` 色阶能够传导到所有经由它解析的语义令牌的原因。
2. 以 `<style data-plugin-css>` 标签注入组件样式表，形态与 DSH 自带插件一致。

该半体没有任何运行时依赖 —— 不用 React，不用 schema 库。它从不导入其它插件的代码，
而是通过 Cordis 访问主题服务，并通过 UI 组件公开的 `data-*` 属性定位 DOM，
绝不依赖它们带哈希的 CSS Module 类名。

由于宿主行是惰性的，禁用它就是任意 loader 行都支持的 `enabled: false`；
卸载后也不留残留 —— 令牌层被移除，style 标签被删除。

## 兼容性

| DSH | 状态 |
| --- | --- |
| `0.2.0-rc.2` | 兼容 |

主题依赖 `@deepseek-ai/dsh-client-ui-theme` 提供的 `ctx.theme` 服务，以及
`data-chat-flow-kind`、`data-composer-*`、`data-code-block-banner` 这些属性。
若未来版本改了名字，插件会降级而不是弄坏应用：缺服务只是少掉颜色层，
缺属性只是少掉一条规则。

## 开发

```sh
npm install
npm test        # 类型检查、构建、CSS 校验、行为冒烟测试
npm run build   # lib/index.js + lib/client.js
```

`npm test` 不是摆设。`scripts/verify-css.mjs` 用 lightningcss 解析样式表，
只要某条规则读取了未声明的 `--cct-*` 变量、或选中了带哈希的类名，就会失败。
`scripts/smoke.mjs` 按 Web shell 的方式执行构建产物 —— 通过
`window.__ModuleLoader__.load`，对着桩 DOM 运行 —— 并断言覆盖表是良构的
`{ light, dark }` 对，且销毁时会撤回两处注册。

### 发布

`prepublishOnly` 会跑完整测试，因此不可能发布出一个连自身测试都过不了的包：

```sh
npm login          # 每台机器一次
npm publish        # 类型检查 -> 构建 -> verify:css -> smoke -> 上传
```

只想预览将要上传的内容而不真正发布：

```sh
npm pack --dry-run
```

## 许可

[MIT](./LICENSE)
