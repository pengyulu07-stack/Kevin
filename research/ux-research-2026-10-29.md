# DAYTONE：桌面优先的研究与改版依据（2026-10-29）

## 研究边界

本轮围绕用户给出的 SIDE B 截图、日听现有页面与功能需求，建立两个各 50 项的资料组和两个各 50 项的 GitHub 对照组。下方共 **100 个资料链接、100 个 GitHub 项目**。GitHub 项目逐一读取了 README 的开头与功能描述；资料逐一通过检索结果确认主题，关键指南进一步阅读正文。这里是设计研究索引和实现判断，不代表对 200 个项目做了完整代码审计，也不代表复制其代码或拥有其图片版权。

## 用户真正要完成的事

1. **现在就看**：打开日听后选日期，立即看当天歌曲、论坛、Top 5，不先学会电影入口或页面层级。
2. **找到对味内容**：从总榜进入分类、语言榜、私人小组；能看今日和历来榜，知道排名由 Vote 决定。
3. **迅速分享**：标题必填；链接、歌手、封面、音频、备注可选；发后可改；歌单跨日期保存。
4. **在原平台听**：可播放本站获授权上传的音频、可用官方嵌入播放器的链接；其他链接一键去原平台。跨平台网页无法保证未授权的完整歌曲都能站内播放。
5. **交流和回访**：看作者、评论、六个表情、独立的 Vote，收到相关通知，保存/关注自己想再看的内容。
6. **保留个性**：电脑端有纸感日历、电影气氛和画廊；个人背景、语言、通知可自行选择，默认界面无需预先配置。

## 对照后的产品取舍

| 方案 | 长处 | 日听采用方式 |
| --- | --- | --- |
| SIDE B 式首页直达 Today / Charts / Calendar | 新用户立即看到内容，入口可预测 | 固定可见的顶部导航；纸感日历直接展示当天 Top 5 与论坛，而电影入口保留为可选体验 |
| 电影式连续进入 | 情绪强、辨识度高 | 留作“Cinema entrance”和音乐 Top 3 画廊，不挡住日常查找 |
| Spotify / Apple 官方嵌入 | 链接可打开原平台的播放器 | Spotify 与 Apple Music 符合格式的链接使用官方 iframe；本站音频和公开直链用原生播放；其余平台保留直达链接 |
| 推荐算法自动排序 | 发现内容容易，但容易遮蔽冷门分享 | 排名显示明确 Vote 数；全部歌曲、日期和分类都可直接查看，不用不透明推荐算法 |
| 复杂自定义主页 | 个性化强，但首次配置负担高 | 保留背景、通知、语言的可选设置；默认主页直接可用 |
| 论坛式高互动 | 讨论更连续 | 论坛榜保留回复与表态热度；音乐榜由独立 Vote 排名，表情不改变票数 |

## 对新方向的具体判断

### 代表性代码对照

| 项目 | 观察到的做法 | 日听的决定 |
| --- | --- | --- |
| [ListenBrainz](https://github.com/metabrainz/listenbrainz-server) | 听歌记录、用户资料、发现内容各有自己的入口 | 让今日分享、历来榜、歌单保持可区分，不用一种列表承担全部任务 |
| [Discourse](https://github.com/discourse/discourse) / [Flarum](https://github.com/flarum/flarum) | 讨论以主题为单位，列表先给标题与参与线索 | 论坛首页显示前三热帖，全部讨论按日期和时间可浏览 |
| [Instant.fm](https://github.com/feross/Instant.fm) / [musicboxd](https://github.com/aetomack/musicboxd) | 音乐链接和社交分享结合，但播放依赖来源服务 | 保留来源链接与可复制标题，播放能力逐平台验证 |
| [React Big Calendar](https://github.com/bigcalendar/react-big-calendar) / [FullCalendar](https://github.com/fullcalendar/fullcalendar) | 日期是直接访问内容的索引 | 纸感月历选日后就能看当天内容，不要求再穿过场景页 |
| [spotify-url-info](https://github.com/microlinkhq/spotify-url-info) / [oEmbed extractor](https://github.com/extractus/oembed-extractor) | 链接可用于抓取公开元数据，但来源格式与访问限制各异 | Spotify 先用官方 oEmbed/iframe；QQ、网易、Apple 分开验证，不把抓取失败当作不能发歌 |
| [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) | 上传前压缩图片能降低存储与传输成本 | 保留前端压缩与明确的大小提示，评论照片仍可发 |
| [a11y-dialog](https://github.com/KittyGiraudel/a11y-dialog) / [Micromodal](https://github.com/micromodal/Micromodal) | 弹窗应处理焦点、Escape 和关闭后的返回位置 | 发布、设置和讨论继续使用可键盘操作的 dialog，并验证焦点返回 |
| [View Transitions](https://github.com/WICG/view-transitions) / [ScrollReveal](https://github.com/jlmakes/scrollreveal) | 过渡能提示页面关系，过量动画会拖慢任务 | 日期和画廊过渡保持短促；尊重减少动画设置 |
| [Octobox](https://github.com/octobox/octobox) / [Universal Inbox](https://github.com/universal-inbox/universal-inbox) | 通知可以集中、过滤、逐条处理 | 小铃铛和右侧文字使用同一偏好，不在不同页面重复弹出同一事件 |
| [Moufette](https://github.com/moufette-tools/moufette) / [GOV.UK Feedback](https://design-system.service.gov.uk/components/feedback/) | 反馈入口要持续可找到，但不能盖住主要内容 | 日历保留反馈入口，后续观察是否需要全站页脚入口 |

- **发现与回访**：分类关注上限按用户最新决定改为五个；日历直接显示当日 Top 5、周/月榜和整月日期索引，歌单与私人小组另有入口。保持榜单数量可选，避免五个榜单同时挤在日历中央。以后优先补“最近看过”和“保存的内容”。依据 NN/g 关于[推荐内容反馈](https://www.nngroup.com/articles/recommendation-guidelines/)和[自定义与个性化](https://www.nngroup.com/articles/customization-personalization/)的分析。
- **只填歌名发布**：在歌名输入停顿后查找公开曲库，精确匹配时先填歌手和官方播放链接，同名版本保持可切换。用户自己填写的歌名不被自动改写；搜索失败仍可只填歌名。此决定来自 Apple 的[搜索结果字段说明](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/UnderstandingSearchResults.html)及本地多版本实测。封面只使用发布者自己上传的图片；不自动取用第三方专辑图。
- **能否直接听**：平台授权决定站内播放能力。Spotify [Embed](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed)与 Apple [Marketing Tools](https://artists.apple.com/support/1117-apple-music-marketing-tools)提供官方播放器；公开音频直链可尝试浏览器原生播放。QQ、网易等暂保留原页直达，不以未经证实的接口或转存录音作为默认方案。
- **表态**：一人一歌一票，可撤销；六个表情继续表达感受。Vote 决定榜单，Emoji 不改排名。论坛热度仍看回复与参与。
- **空状态**：当天无人发歌时仍显示入口和明确的“分享第一首”；避免空白榜。依据[空状态设计](https://www.nngroup.com/articles/empty-state-interface-design/)。
- **动画**：日期切换、进入榜单和弹窗只使用简短过渡；持续旋转的唱片应可停，系统要求减少动画时停止。依据[NN/g 动效用途](https://www.nngroup.com/articles/animation-purpose-ux/)、[W3C 暂停运动内容](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)和[MDN 减少动画设置](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)。
- **性能**：桌面画廊的大图要保持完整视觉比例；列表小图延迟加载，首屏主图不要懒加载；第三方播放器仅在用户打开具体歌曲时加载。依据[web.dev 图片延迟加载](https://web.dev/learn/performance/lazy-load-images-and-iframe-elements)与[INP](https://web.dev/articles/inp)。
- **安全与版权**：用户输入的链接只按允许的域名和资源格式生成 iframe；QQ、网易等未经确认的接口不作为站内播放方案。上传内容须由分享者有权使用，站点不能下载第三方音频转存。
- **尚需用户实测**：研究只能给出设计假设。真实朋友是否更快找到歌曲，需要观察从首页到“找到、播放、Vote、回复、分享”的任务完成情况与卡点。

## 资料索引：原有方向 50 项

1. [Memory Recognition and Recall in User Interfaces](https://www.nngroup.com/articles/recognition-and-recall/) — UX 研究。
2. [Onboarding Tutorials vs. Contextual Help](https://www.nngroup.com/articles/onboarding-tutorials/) — UX 研究。
3. [10 Usability Heuristics for User Interface Design](https://www.nngroup.com/articles/ten-usability-heuristics/) — UX 研究。
4. [3 Common IA Mistakes (that Are All Due to Low Information Scent)](https://www.nngroup.com/articles/3-ia-mistakes/) — UX 研究。
5. [Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) — UX 研究。
6. [Low Findability and Discoverability: Four Testing Methods to Identify the Causes](https://www.nngroup.com/articles/navigation-ia-tests/) — UX 研究。
7. [Beyond the Hamburger: What Makes Navigation Discoverable on Desktops](https://www.nngroup.com/articles/find-navigation-desktop-not-hamburger/) — UX 研究。
8. [Local Navigation Is a Valuable Orientation and Wayfinding Aid](https://www.nngroup.com/articles/local-navigation/) — UX 研究。
9. [Date-Input Form Fields: UX Design Guidelines](https://www.nngroup.com/articles/date-input/) — UX 研究。
10. [10 Design Guidelines for Reporting Errors in Forms](https://www.nngroup.com/articles/errors-forms-design-guidelines/) — UX 研究。
11. [User Intent Affects Filter Design](https://www.nngroup.com/articles/applying-filters/) — UX 研究。
12. [Placeholders in Form Fields Are Harmful](https://www.nngroup.com/articles/form-design-placeholders/) — UX 研究。
13. [Website Forms Usability: Top 10 Recommendations](https://www.nngroup.com/articles/web-form-design/) — UX 研究。
14. [Few Guesses, More Success: 4 Principles to Reduce Cognitive Load in Forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/) — UX 研究。
15. [Helpful Filter Categories and Values for Better UX](https://www.nngroup.com/articles/filter-categories-values/) — UX 研究。
16. [Indicators, Validations, and Notifications: Pick the Correct Communication Option](https://www.nngroup.com/articles/indicators-validations-notifications/) — UX 研究。
17. [Hostile Patterns in Error Messages](https://www.nngroup.com/articles/hostile-error-messages/) — UX 研究。
18. [Filters vs. Facets: Definitions](https://www.nngroup.com/articles/filters-vs-facets/) — UX 研究。
19. [Data Tables: Four Major User Tasks](https://www.nngroup.com/articles/data-tables/) — UX 研究。
20. [Understanding Success Criterion 3.2.3: Consistent Navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation) — 无障碍标准。
21. [Understanding Success Criterion 2.4.5: Multiple Ways](https://www.w3.org/WAI/WCAG22/Understanding/multiple-ways) — 无障碍标准。
22. [Understanding Success Criterion 3.2.4: Consistent Identification](https://www.w3.org/WAI/WCAG22/Understanding/consistent-identification) — 无障碍标准。
23. [Understanding Success Criterion 4.1.3: Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) — 无障碍标准。
24. [Understanding Success Criterion 3.3.2: Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions) — 无障碍标准。
25. [Designing for Web Accessibility – Tips for Getting Started](https://www.w3.org/WAI/tips/designing/) — 无障碍标准。
26. [Understanding Guideline 2.4: Navigable](https://www.w3.org/WAI/WCAG22/Understanding/navigable) — 无障碍标准。
27. [G61: Presenting repeated components in the same relative order each time they appear](https://www.w3.org/WAI/WCAG22/Techniques/general/G61.html) — 无障碍标准。
28. [E-Commerce Homepage & Category Navigation – Baymard](https://baymard.com/research/homepage-and-category-usability) — 内容发现。
29. [Breadcrumbs – GOV.UK Design System](https://design-system.service.gov.uk/components/breadcrumbs/) — 组件规范。
30. [Tabs – GOV.UK Design System](https://design-system.service.gov.uk/components/tabs/) — 组件规范。
31. [2024 Product Finding Research Update – Baymard](https://baymard.com/research-articles/product-finding-2024-launch) — 内容发现。
32. [Homepage & Navigation UX Best Practices 2025 – Baymard](https://baymard.com/research-articles/ecommerce-navigation-best-practice) — 内容发现。
33. [Make Product Categories the Top-Level Navigation Items on Mobile Sites (33% Don’t) – Baymard](https://baymard.com/research-articles/main-navigation-product-categories) — 内容发现。
34. [Category Navigation & Curated Paths Vs Search](https://baymard.com/research-articles/apparel-search) — 内容发现。
35. [Accordion – GOV.UK Design System](https://design-system.service.gov.uk/components/accordion/) — 组件规范。
36. [Homepage UX: Featuring Product Breadth – Baymard](https://baymard.com/research-articles/inferring-product-catalog-from-homepage) — 内容发现。
37. [Creating an Embed](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed) — Spotify 官方。
38. [oEmbed API](https://developer.spotify.com/documentation/embeds/reference/oembed) — Spotify 官方。
39. [<audio> HTML embed audio element - HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/audio) — 浏览器规范。
40. [iTunes Search API: Overview](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html) — Apple 官方。
41. [iTunes Search API: Understanding Search Results](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/UnderstandingSearchResults.html) — Apple 官方。
42. [Same-origin policy - Security](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy) — 浏览器规范。
43. [iTunes Search API: Search Examples](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/SearchExamples.html) — Apple 官方。
44. [<iframe> HTML inline frame element - HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe) — 浏览器规范。
45. [Clipboard API - Web APIs](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API) — 浏览器规范。
46. [Clipboard: readText() method - Web APIs](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText) — 浏览器规范。
47. [User activation - Security](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/User_activation) — 浏览器规范。
48. [Information Scent: How Users Decide Where to Go Next](https://www.nngroup.com/articles/information-scent/) — UX 研究。
49. [Avoid Format-Based Primary Navigation](https://www.nngroup.com/articles/format-based-navigation/) — UX 研究。
50. [Basic Patterns for Mobile Navigation](https://www.nngroup.com/articles/mobile-navigation-patterns/) — UX 研究。

## 资料索引：新增的用户需求方向 50 项

51. [Information Foraging: A Theory of How People Navigate on the Web](https://www.nngroup.com/articles/information-foraging/) — UX 研究。
52. [Search and You May Find](https://www.nngroup.com/articles/search-and-you-may-find/) — UX 研究。
53. [inp](https://web.dev/articles/inp) — 性能指南。
54. [Understanding Success Criterion 2.2.2: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) — 无障碍标准。
55. [Optimize Core Web Vitals for business decision makers](https://web.dev/articles/optimize-cwv-business) — 性能指南。
56. [animations](https://www.w3.org/WAI/tutorials/carousels/animations/) — 无障碍标准。
57. [understanding inp](https://web.dev/codelabs/understanding-inp) — 性能指南。
58. [Debug performance in the field](https://web.dev/articles/debug-performance-in-the-field) — 性能指南。
59. [Find slow interactions in the field](https://web.dev/articles/find-slow-interactions-in-the-field) — 性能指南。
60. [UX Guidelines for Recommended Content](https://www.nngroup.com/articles/recommendation-guidelines/) — UX 研究。
61. [Customization vs. Personalization in the User Experience](https://www.nngroup.com/articles/customization-personalization/) — UX 研究。
62. [Personalization is Over-Rated](https://www.nngroup.com/articles/personalization-is-over-rated/) — UX 研究。
63. [7 Tips for Successful Customization](https://www.nngroup.com/articles/customization/) — UX 研究。
64. [Three Methods to Increase User Autonomy in UX Design](https://www.nngroup.com/articles/increase-user-autonomy/) — UX 研究。
65. [Usability Heuristic #7)](https://www.nngroup.com/articles/flexibility-efficiency-heuristic/) — UX 研究。
66. [6 Tips for Successful Personalization](https://www.nngroup.com/articles/personalization/) — UX 研究。
67. [Social Proof in the User Experience](https://www.nngroup.com/articles/social-proof-ux/) — UX 研究。
68. [Designing Useful Smart Home Notifications](https://www.nngroup.com/articles/smart-home-notifications/) — UX 研究。
69. [The Dangers of Overpersonalization](https://www.nngroup.com/articles/overpersonalization/) — UX 研究。
70. [Five Mistakes in Designing Mobile Push Notifications](https://www.nngroup.com/articles/push-notification/) — UX 研究。
71. [Web Share API - Web APIs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) — 浏览器规范。
72. [The State of Ecommerce Search](https://www.nngroup.com/articles/state-ecommerce-search/) — UX 研究。
73. [Navigating Information Spaces: Article by Jakob Nielsen](https://www.nngroup.com/articles/navigating-large-information-spaces/) — UX 研究。
74. [Top 10 Enduring Web-Design Mistakes](https://www.nngroup.com/articles/top-10-enduring/) — UX 研究。
75. [Input validation - Security](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Input_validation) — 浏览器规范。
76. [Understanding Success Criterion 2.4.13: Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance) — 无障碍标准。
77. [Designing Empty States in Complex Applications: 3 Guidelines](https://www.nngroup.com/articles/empty-state-interface-design/) — UX 研究。
78. [new in 22](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) — 无障碍标准。
79. [Responsive images](https://web.dev/learn/design/responsive-images) — 性能指南。
80. [Preload responsive images](https://web.dev/articles/preload-responsive-images) — 性能指南。
81. [Designing for Serial Task Switching](https://www.nngroup.com/articles/serial-task-switching/) — UX 研究。
82. [Lazy load images and <iframe> elements](https://web.dev/learn/performance/lazy-load-images-and-iframe-elements) — 性能指南。
83. [Understanding Success Criterion 2.4.3: Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) — 无障碍标准。
84. [Usability Heuristic #3)](https://www.nngroup.com/articles/user-control-and-freedom/) — UX 研究。
85. [Images](https://web.dev/learn/html/images) — 性能指南。
86. [View Transition API - Web APIs](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API) — 浏览器规范。
87. [Feedback – GOV.UK Design System](https://design-system.service.gov.uk/components/feedback/) — 组件规范。
88. [Using the View Transition API - Web APIs](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using) — 浏览器规范。
89. [Pagination – GOV.UK Design System](https://design-system.service.gov.uk/components/pagination/) — 组件规范。
90. [prefers-reduced-motion CSS media feature - CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) — 浏览器规范。
91. [Animating Between Views](https://web.dev/articles/animating-between-views) — 性能指南。
92. [Sec-CH-Prefers-Reduced-Motion header - HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Sec-CH-Prefers-Reduced-Motion) — 浏览器规范。
93. [IntersectionObserver - Web APIs](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver) — 浏览器规范。
94. [Animations and performance](https://web.dev/articles/animations-and-performance) — 性能指南。
95. [iFrame API](https://developer.spotify.com/documentation/embeds/references/iframe-api) — Spotify 官方。
96. [Using the iFrame API](https://developer.spotify.com/documentation/embeds/tutorials/using-the-iframe-api) — Spotify 官方。
97. [Troubleshooting](https://developer.spotify.com/documentation/embeds/tutorials/troubleshooting) — Spotify 官方。
98. [Apple Music Marketing Tools - Apple Music for Artists](https://artists.apple.com/support/1117-apple-music-marketing-tools) — Apple 官方。
99. [Web API Reference](https://developer.spotify.com/documentation/web-api/reference/get-track) — Spotify 官方。
100. [Spotify URIs and IDs](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) — Spotify 官方。

## GitHub 对照：音乐、论坛、日历与链接 50 项

1. [metabrainz/listenbrainz-server](https://github.com/metabrainz/listenbrainz-server) — 已读项目说明；对照内容架构、交互或媒体处理。
2. [discourse/discourse](https://github.com/discourse/discourse) — 已读项目说明；对照内容架构、交互或媒体处理。
3. [flarum/flarum](https://github.com/flarum/flarum) — 已读项目说明；对照内容架构、交互或媒体处理。
4. [NodeBB/NodeBB](https://github.com/NodeBB/NodeBB) — 已读项目说明；对照内容架构、交互或媒体处理。
5. [LemmyNet/lemmy](https://github.com/LemmyNet/lemmy) — 已读项目说明；对照内容架构、交互或媒体处理。
6. [ONEARMY/community-platform](https://github.com/ONEARMY/community-platform) — 已读项目说明；对照内容架构、交互或媒体处理。
7. [cblgh/cerca](https://github.com/cblgh/cerca) — 已读项目说明；对照内容架构、交互或媒体处理。
8. [flaskbb/flaskbb](https://github.com/flaskbb/flaskbb) — 已读项目说明；对照内容架构、交互或媒体处理。
9. [lincanbin/Carbon-Forum](https://github.com/lincanbin/Carbon-Forum) — 已读项目说明；对照内容架构、交互或媒体处理。
10. [nukeop/nuclear](https://github.com/nukeop/nuclear) — 已读项目说明；对照内容架构、交互或媒体处理。
11. [algerkong/AlgerMusicPlayer](https://github.com/algerkong/AlgerMusicPlayer) — 已读项目说明；对照内容架构、交互或媒体处理。
12. [pear-devs/pear-desktop](https://github.com/pear-devs/pear-desktop) — 已读项目说明；对照内容架构、交互或媒体处理。
13. [feross/Instant.fm](https://github.com/feross/Instant.fm) — 已读项目说明；对照内容架构、交互或媒体处理。
14. [abhisheknaiidu/a-pop](https://github.com/abhisheknaiidu/a-pop) — 已读项目说明；对照内容架构、交互或媒体处理。
15. [aetomack/musicboxd](https://github.com/aetomack/musicboxd) — 已读项目说明；对照内容架构、交互或媒体处理。
16. [microlinkhq/spotify-url-info](https://github.com/microlinkhq/spotify-url-info) — 已读项目说明；对照内容架构、交互或媒体处理。
17. [hyvor/unfold](https://github.com/hyvor/unfold) — 已读项目说明；对照内容架构、交互或媒体处理。
18. [web-scrobbler/web-scrobbler](https://github.com/web-scrobbler/web-scrobbler) — 已读项目说明；对照内容架构、交互或媒体处理。
19. [bigcalendar/react-big-calendar](https://github.com/bigcalendar/react-big-calendar) — 已读项目说明；对照内容架构、交互或媒体处理。
20. [wix/react-native-calendars](https://github.com/wix/react-native-calendars) — 已读项目说明；对照内容架构、交互或媒体处理。
21. [namespace-ee/react-calendar-timeline](https://github.com/namespace-ee/react-calendar-timeline) — 已读项目说明；对照内容架构、交互或媒体处理。
22. [mattlewis92/angular-calendar](https://github.com/mattlewis92/angular-calendar) — 已读项目说明；对照内容架构、交互或媒体处理。
23. [clauderic/react-infinite-calendar](https://github.com/clauderic/react-infinite-calendar) — 已读项目说明；对照内容架构、交互或媒体处理。
24. [MoeKoeMusic/MoeKoeMusic](https://github.com/MoeKoeMusic/MoeKoeMusic) — 已读项目说明；对照内容架构、交互或媒体处理。
25. [lklynet/aurral](https://github.com/lklynet/aurral) — 已读项目说明；对照内容架构、交互或媒体处理。
26. [staniel359/muffon](https://github.com/staniel359/muffon) — 已读项目说明；对照内容架构、交互或媒体处理。
27. [TheWicklowWolf/Lidify](https://github.com/TheWicklowWolf/Lidify) — 已读项目说明；对照内容架构、交互或媒体处理。
28. [DroppedNeedle/DroppedNeedle](https://github.com/DroppedNeedle/DroppedNeedle) — 已读项目说明；对照内容架构、交互或媒体处理。
29. [Aufree/ting](https://github.com/Aufree/ting) — 已读项目说明；对照内容架构、交互或媒体处理。
30. [kineteklabs/twotone](https://github.com/kineteklabs/twotone) — 已读项目说明；对照内容架构、交互或媒体处理。
31. [vibe-music/vibe-music-web](https://github.com/vibe-music/vibe-music-web) — 已读项目说明；对照内容架构、交互或媒体处理。
32. [AdonisEnProvence/MusicRoom](https://github.com/AdonisEnProvence/MusicRoom) — 已读项目说明；对照内容架构、交互或媒体处理。
33. [skeptrunedev/jukebox](https://github.com/skeptrunedev/jukebox) — 已读项目说明；对照内容架构、交互或媒体处理。
34. [connietran-dev/playlistr](https://github.com/connietran-dev/playlistr) — 已读项目说明；对照内容架构、交互或媒体处理。
35. [penta-jelly/re-radio](https://github.com/penta-jelly/re-radio) — 已读项目说明；对照内容架构、交互或媒体处理。
36. [vinayakgavariya/PlaylistAdda](https://github.com/vinayakgavariya/PlaylistAdda) — 已读项目说明；对照内容架构、交互或媒体处理。
37. [John-Weeks-Dev/music-social-network](https://github.com/John-Weeks-Dev/music-social-network) — 已读项目说明；对照内容架构、交互或媒体处理。
38. [fsahin/artist-explorer](https://github.com/fsahin/artist-explorer) — 已读项目说明；对照内容架构、交互或媒体处理。
39. [mroushdy/tagthis](https://github.com/mroushdy/tagthis) — 已读项目说明；对照内容架构、交互或媒体处理。
40. [PanagiotisVK/Sift](https://github.com/PanagiotisVK/Sift) — 已读项目说明；对照内容架构、交互或媒体处理。
41. [shijithpk/music-discovery](https://github.com/shijithpk/music-discovery) — 已读项目说明；对照内容架构、交互或媒体处理。
42. [metabrainz/liblistenbrainz](https://github.com/metabrainz/liblistenbrainz) — 已读项目说明；对照内容架构、交互或媒体处理。
43. [linkpreview/linkpreview](https://github.com/linkpreview/linkpreview) — 已读项目说明；对照内容架构、交互或媒体处理。
44. [Suven/astro-link-previews](https://github.com/Suven/astro-link-previews) — 已读项目说明；对照内容架构、交互或媒体处理。
45. [dokalldotcom/link-preview](https://github.com/dokalldotcom/link-preview) — 已读项目说明；对照内容架构、交互或媒体处理。
46. [libre-fm/gnu-fm](https://github.com/libre-fm/gnu-fm) — 已读项目说明；对照内容架构、交互或媒体处理。
47. [airsonic/airsonic](https://github.com/airsonic/airsonic) — 已读项目说明；对照内容架构、交互或媒体处理。
48. [navidrome/apple-music-plugin](https://github.com/navidrome/apple-music-plugin) — 已读项目说明；对照内容架构、交互或媒体处理。
49. [aquantumofdonuts/mixarr](https://github.com/aquantumofdonuts/mixarr) — 已读项目说明；对照内容架构、交互或媒体处理。
50. [Spotui/Spotui](https://github.com/Spotui/Spotui) — 已读项目说明；对照内容架构、交互或媒体处理。

## GitHub 对照：反馈、通知、动效、元数据、图片、弹窗与社交 50 项

51. [ueman/feedback](https://github.com/ueman/feedback) — 已读项目说明；对照更便捷及可自定义的功能。
52. [mydnic/volet](https://github.com/mydnic/volet) — 已读项目说明；对照更便捷及可自定义的功能。
53. [moufette-tools/moufette](https://github.com/moufette-tools/moufette) — 已读项目说明；对照更便捷及可自定义的功能。
54. [18F/feedback-widget](https://github.com/18F/feedback-widget) — 已读项目说明；对照更便捷及可自定义的功能。
55. [feedback-fish/feedback-fish-react](https://github.com/feedback-fish/feedback-fish-react) — 已读项目说明；对照更便捷及可自定义的功能。
56. [mikenikles/svelte-feedback-widget](https://github.com/mikenikles/svelte-feedback-widget) — 已读项目说明；对照更便捷及可自定义的功能。
57. [octobox/octobox](https://github.com/octobox/octobox) — 已读项目说明；对照更便捷及可自定义的功能。
58. [acapela/monorepo](https://github.com/acapela/monorepo) — 已读项目说明；对照更便捷及可自定义的功能。
59. [universal-inbox/universal-inbox](https://github.com/universal-inbox/universal-inbox) — 已读项目说明；对照更便捷及可自定义的功能。
60. [magicbell/magicbell-js](https://github.com/magicbell/magicbell-js) — 已读项目说明；对照更便捷及可自定义的功能。
61. [magicbell/pwa-inbox](https://github.com/magicbell/pwa-inbox) — 已读项目说明；对照更便捷及可自定义的功能。
62. [Fliplet/fliplet-widget-notification-inbox](https://github.com/Fliplet/fliplet-widget-notification-inbox) — 已读项目说明；对照更便捷及可自定义的功能。
63. [jlmakes/scrollreveal](https://github.com/jlmakes/scrollreveal) — 已读项目说明；对照更便捷及可自定义的功能。
64. [shuding/next-view-transitions](https://github.com/shuding/next-view-transitions) — 已读项目说明；对照更便捷及可自定义的功能。
65. [WICG/view-transitions](https://github.com/WICG/view-transitions) — 已读项目说明；对照更便捷及可自定义的功能。
66. [igorm84/spotify-astro-transitions](https://github.com/igorm84/spotify-astro-transitions) — 已读项目说明；对照更便捷及可自定义的功能。
67. [Borewit/music-metadata](https://github.com/Borewit/music-metadata) — 已读项目说明；对照更便捷及可自定义的功能。
68. [Borewit/music-metadata-browser](https://github.com/Borewit/music-metadata-browser) — 已读项目说明；对照更便捷及可自定义的功能。
69. [Borewit/musicbrainz-api](https://github.com/Borewit/musicbrainz-api) — 已读项目说明；对照更便捷及可自定义的功能。
70. [aadsm/node-id3](https://github.com/aadsm/node-id3) — 已读项目说明；对照更便捷及可自定义的功能。
71. [kellnerd/harmony](https://github.com/kellnerd/harmony) — 已读项目说明；对照更便捷及可自定义的功能。
72. [clangen/musikcube](https://github.com/clangen/musikcube) — 已读项目说明；对照更便捷及可自定义的功能。
73. [Donaldcwl/browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) — 已读项目说明；对照更便捷及可自定义的功能。
74. [addyosmani/squish](https://github.com/addyosmani/squish) — 已读项目说明；对照更便捷及可自定义的功能。
75. [davejm/client-compress](https://github.com/davejm/client-compress) — 已读项目说明；对照更便捷及可自定义的功能。
76. [awesome-compressor/browser-compress-image](https://github.com/awesome-compressor/browser-compress-image) — 已读项目说明；对照更便捷及可自定义的功能。
77. [reactjs/react-modal](https://github.com/reactjs/react-modal) — 已读项目说明；对照更便捷及可自定义的功能。
78. [gdkraus/accessible-modal-dialog](https://github.com/gdkraus/accessible-modal-dialog) — 已读项目说明；对照更便捷及可自定义的功能。
79. [humaan/Modaal](https://github.com/humaan/Modaal) — 已读项目说明；对照更便捷及可自定义的功能。
80. [micromodal/Micromodal](https://github.com/micromodal/Micromodal) — 已读项目说明；对照更便捷及可自定义的功能。
81. [KittyGiraudel/a11y-dialog](https://github.com/KittyGiraudel/a11y-dialog) — 已读项目说明；对照更便捷及可自定义的功能。
82. [scottaohara/accessible_modal_window](https://github.com/scottaohara/accessible_modal_window) — 已读项目说明；对照更便捷及可自定义的功能。
83. [iamcal/oembed](https://github.com/iamcal/oembed) — 已读项目说明；对照更便捷及可自定义的功能。
84. [extractus/oembed-extractor](https://github.com/extractus/oembed-extractor) — 已读项目说明；对照更便捷及可自定义的功能。
85. [jacktuck/unfurl](https://github.com/jacktuck/unfurl) — 已读项目说明；对照更便捷及可自定义的功能。
86. [php-embed/Embed](https://github.com/php-embed/Embed) — 已读项目说明；对照更便捷及可自定义的功能。
87. [diaspora/diaspora](https://github.com/diaspora/diaspora) — 已读项目说明；对照更便捷及可自定义的功能。
88. [opensource-socialnetwork/opensource-socialnetwork](https://github.com/opensource-socialnetwork/opensource-socialnetwork) — 已读项目说明；对照更便捷及可自定义的功能。
89. [humhub/humhub](https://github.com/humhub/humhub) — 已读项目说明；对照更便捷及可自定义的功能。
90. [Ocelot-Social-Community/Ocelot-Social](https://github.com/Ocelot-Social-Community/Ocelot-Social) — 已读项目说明；对照更便捷及可自定义的功能。
91. [OpenVK/openvk](https://github.com/OpenVK/openvk) — 已读项目说明；对照更便捷及可自定义的功能。
92. [Human-Connection/Human-Connection](https://github.com/Human-Connection/Human-Connection) — 已读项目说明；对照更便捷及可自定义的功能。
93. [mario-huang/squoosh-browser](https://github.com/mario-huang/squoosh-browser) — 已读项目说明；对照更便捷及可自定义的功能。
94. [sweetalert2/sweetalert2](https://github.com/sweetalert2/sweetalert2) — 已读项目说明；对照更便捷及可自定义的功能。
95. [ruby-oembed/ruby-oembed](https://github.com/ruby-oembed/ruby-oembed) — 已读项目说明；对照更便捷及可自定义的功能。
96. [fullcalendar/fullcalendar](https://github.com/fullcalendar/fullcalendar) — 已读项目说明；对照更便捷及可自定义的功能。
97. [plausible/analytics](https://github.com/plausible/analytics) — 已读项目说明；对照更便捷及可自定义的功能。
98. [umami-software/umami](https://github.com/umami-software/umami) — 已读项目说明；对照更便捷及可自定义的功能。
99. [queen-raae/gatsby-remark-oembed](https://github.com/queen-raae/gatsby-remark-oembed) — 已读项目说明；对照更便捷及可自定义的功能。
100. [wrav/oembed](https://github.com/wrav/oembed) — 已读项目说明；对照更便捷及可自定义的功能。

## 实施优先级

1. 首屏日历可看、顶部入口稳定、每天 Top 5 / 全部歌曲 / 论坛直达。
2. Vote 与表情分离；公开榜和小组榜同一计票规则；历史支持迁移一次。
3. 简化发布、支持可用的官方播放器、平台链接和歌单元数据；每个平台逐一验证。
4. 观察真实用户任务后，再决定最近浏览、收藏、搜索和更深个性化，而不是先叠加十几个入口。
