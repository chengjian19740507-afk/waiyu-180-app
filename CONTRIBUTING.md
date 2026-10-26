# 贡献指南 / Contributing

感谢你愿意参与。改动很小，两分钟就能上手。

## 怎么加一句话

1. 找到对应语种的 `sentences-{lang}.json`
2. 照着已有格式追加一条，**保持 `id` 连续**
3. `category` 用已有类别 key，`category_zh` 填中文

```json
{
  "id": 181,
  "category": "taxi",
  "category_zh": "打车",
  "text": "Please take me to this address.",
  "romanization": "Please take me to this address.",
  "translation": "请带我到这个地址。"
}
```

## 加一个新语种

1. 复制一份 `sentences-en.json` 为 `sentences-{code}.json`
2. 逐条翻译 `text`，并补 `romanization`（阿语 / 日 / 韩等需拼音或转写）
3. 在 `waiyu-180-final.js` 的 `LANGS` 里加一条配置：`label` / `sub` / `file` / `tts` / `lang`
4. 在 `index.html` 的语种条里加一个 `.lang-chip`

## 提交前必跑

```bash
npm run check:atlas
```

校验 13 语种句数一致、类别对齐、字段完整。**CI 会自动跑这个检查**，不过就别提交。

## 约定

- 一次 PR 只做一件事（加语种 / 加场景 / 改 UI 分开）
- 译文请用**口语化**表达，不是教科书翻译——这是应急用语
- 不要改动 `LICENSE` / `LICENSE-DATA`，那是授权条款

## 联系

chengjian19740507@gmail.com
