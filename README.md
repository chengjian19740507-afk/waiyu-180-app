<div align="center">

# 出境无忧180句 · 13 语种 2340 句速查

**一词一场景，落地就能说。13 语种 · 2340 句 · 18 个真实场景 · 离线发音。**

[在线体验](https://chengjian19740507-afk.github.io/waiyu-180-app/) ·
[隐私协议](https://chengjian19740507-afk.github.io/waiyu-180-app/privacy.html) ·
[用户协议](https://chengjian19740507-afk.github.io/waiyu-180-app/terms.html) ·
[English](README.en.md)

</div>

---

## 这是什么

出境最怕一张嘴就卡壳。**13 个语种 + 18 个真实场景**，够你走完全球大多数国家——从过海关到酒店 check-in，从点餐到问路。每句配 **原文 + 罗马字/拼音 + 中文** 三行对照，点一下就发音，**全程离线、零注册、零后端**。

- 🌐 **13 语种**：英 / 西 / 法 / 阿 / 俄 / 德 / 印地 / 葡 / 日 / 韩 / 越 / 意 / 泰
- 💬 **2340 句**：每语种 180 句，18 个场景
- 📚 **7000 词**：7 个语种各 1000 个高频词，带音标
- 🔊 **离线发音**：网页版走浏览器原生 SpeechSynthesis，**文本不离开你的设备**
- 📱 **微信小程序版**：AppID `wxc90a6aebcd03229c` · 搜索「出国无忧外语180句」
- 🕊️ **无追踪**：不注册、不收集、不埋点、无广告

## 18 个场景

| 类别 | 类别 | 类别 | 类别 |
|---|---|---|---|
| 问候 | 自我介绍 | 机场海关 | 宾馆入住 |
| 前台常用 | 饮食 | 交通 | 购物 |
| 时间日期 | 问路 | 数字 | 家庭 |
| 常用表达 | 餐厅 | 医疗 | 旅游实用 |
| 工作场景 | 社交礼仪 | 签证类型 | — |

> 部分语种不含「签证类型」（以各语种实际数据为准，界面按语种动态显示）。

## 三种用法

**1. 网页版** — 打开即用，无需下载
```
https://chengjian19740507-afk.github.io/waiyu-180-app/
```

**2. 微信小程序** — 微信搜索「**出国无忧外语180句**」
数据全部打包在小程序内，飞机上、地铁里没信号照样查。

**3. 本地运行**
```bash
git clone https://github.com/chengjian19740507-afk/waiyu-180-app.git
cd waiyu-180-app
python3 -m http.server 8000
# 打开 http://localhost:8000
```
> `SpeechSynthesis` 需要 HTTP(S) 协议，不能直接双击打开 `file://`。

## 技术栈

纯静态 HTML + CSS + JavaScript，**零依赖、零后端、零构建**

- 浏览器原生 `SpeechSynthesis`（Chrome / Safari / Edge 自带，无需联网）
- `localStorage` 保存语种偏好与解锁状态
- GitHub Pages 托管
- 响应式布局，手机 / 平板 / 电脑自适应
- 阿语 RTL 从右向左显示
- PWA-ready，可添加到手机主屏幕

## 数据结构

每个 `sentences-{lang}.json` 含 180 条：

```json
{
  "id": 1,
  "category": "greetings",
  "category_zh": "问候",
  "text": "Hello",
  "romanization": "Hello",
  "translation": "你好"
}
```

词表在 `vocabulary-{lang}.json`（英 / 西 / 法 / 俄 / 日 / 韩 / 阿，各 1000 词，含音标）。

## 数据校验

仓库内置一致性校验脚本，保证 13 语种 × 180 句、类别对齐：

```bash
npm run check:atlas
```

## 支持开发

欢迎提 issue、加语种、补场景、改进 UI。详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 致谢

感谢每一位提出 issue、补充语种、翻译校对、推荐工具的朋友。

## License

| 部分 | 许可 | 说明 |
|---|---|---|
| 程序代码 | [MIT](LICENSE) | 商用无需授权 |
| 句库 / 词库数据 | [CC BY-NC 4.0](LICENSE-DATA) | 非商业免费，含翻译与二次创作；**商业使用需授权** |

商业授权见 [LICENSE-COMMERCIAL.md](LICENSE-COMMERCIAL.md) ·
授权联系：chengjian19740507@gmail.com

再分发或二次创作时请保留署名 **「作者：北极虎 / Cheng Jian」** 并注明来源。

---

<div align="center">
<sub>© 2026 成键 / Cheng Jian（北极虎）· 上海市住建委 · 上海世界城市日事务协调中心</sub>
</div>
