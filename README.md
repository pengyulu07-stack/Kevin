# 日听 · DAYTONE

公开网址：<https://pengyulu07-stack.github.io/Kevin/>

这是独立托管的日听音乐分享站。静态页面由 GitHub Pages 提供，账号、歌单、评论、表情和文件由 Supabase 免费项目 `Kevin` 提供。网页不依赖 `chatgpt.site`。

## 访客使用

1. 注册时自选一个六位数字登录号（包含前导零），设置至少八位密码和昵称。
2. 换设备后使用同一个数字登录号和密码登录。本站不收真实邮箱，也**无法通过邮箱找回密码**，因此请自行妥善保存。
3. 每个账号每天最多发布三首歌。只需填写歌名；音乐人、留言、音频文件、外部音乐链接、封面或照片都可选。
4. 音频上限为 8 MB。静态照片可选择至 15 MB，浏览器会在上传前尝试压缩到 1 MB 以内；GIF 动图仍需小于 1 MB。访客可以在歌曲下发表文字或图片评论，并使用 👍 👎 🐶 ❤️ 😭 🤮 六种表情。
5. 首页每天只展示支持数最高的 5 首歌曲，点击“查看当天全部歌曲”可查看完整列表。👍 和 ❤️ 各算一次支持；同分时较新的歌曲靠前。一个账号对同一首歌只能保留一种表情。

请只分享有权公开发布的内容。外部音乐链接能否播放取决于链接所属平台。

## 项目结构

- `index.html`、`src/`：网页界面与交互。
- `public/config.js`：浏览器可公开使用的 Supabase URL 与 publishable key。
- `public/vendor/`：固定版本的 Supabase JavaScript SDK 及 MIT 许可证。
- `schema.sql`、`migrations/`：数据库和存储规则，已应用到项目 `wzgsutbopmfbcxhvvqkv`。
- `scripts/build.mjs`：将静态文件复制到 `dist/`，用于 GitHub Pages 仓库根目录。

本地预览：

```sh
node scripts/build.mjs
python3 -m http.server 8000 -d dist
```

项目配置只可使用浏览器 publishable/anon key，**绝不可放入 `service_role` key、数据库密码或其他私密凭据**。数字登录号在 Supabase Auth 内部映射为不收邮件的占位地址；项目已关闭邮箱确认，匿名登录仍关闭。

## 免费服务的边界

GitHub Pages 已设置从公开仓库 `pengyulu07-stack/Kevin` 的 `main` 分支根目录发布。Supabase 免费存储容量有限，项目长期无人使用可能暂停。公开上传仍可能出现垃圾内容或侵权内容；当前没有举报、审核和管理员下架界面，站长需要检查数据库与存储用量并处理违规内容。六位登录号只有一百万种，账号安全依赖密码和 Supabase 的登录保护；不要使用其他网站上的旧密码。

任何免费第三方服务都无法保证同一网址十年不变。请保留这份源码，并定期备份数据库和音频、图片文件，以便需要时迁移。
