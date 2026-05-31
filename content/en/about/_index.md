---
title: "关于"
description: "关于「告你日语」"
date: 2020-10-06T08:49:55+00:00
draft: false
images: []
---

## 关于「告你日语」

「告你日语」是我个人用来记录学习日语的笔记的网站，代码开源。

## 关于发音和翻译

例句的发音和翻译仅提供给 `ja-note` 笔记块的第一行日语文本。普通 Markdown 段落和列表不会显示发音和翻译按钮。

```md
{{</* ja-note */>}}
日本語の勉強は楽しいです。
学习日语很有趣。
{{</* /ja-note */>}}
```

效果示例：

{{< ja-note >}}
日本語の勉強は楽しいです。
学习日语很有趣。
{{< /ja-note >}}

### 发音

发音采用浏览器发音接口。

优先采用浏览器内置在线发音，没有在线发音会使用本地发音，如果本地没有日文语音包则发音不正常。推荐使用 **Edge** 浏览器进行访问，语音柔和自然准确。

阅读更多：

1. [大声朗读pwa应用](https://github.com/guozhigq/ReadAloud)
2. [SpeechSynthesis MDN](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/speak)

### 翻译

采用腾讯翻译接口。

阅读更多：

1. [腾讯翻译API接口](https://cloud.tencent.com/document/api/551/15619)
2. [Netlify Functions](https://www.netlify.com/products/functions/)
