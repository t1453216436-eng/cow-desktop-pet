# 奶牛桌宠 PWA

这是一个不需要 Mac、不需要 Xcode 的 iPhone 奶牛桌宠网页 App。

## 文件位置

```text
D:\手机桌面宠物APP\CowDesktopPetWeb
```

## 在电脑上预览

直接双击打开：

```text
D:\手机桌面宠物APP\CowDesktopPetWeb\index.html
```

## 安装到 iPhone 主屏幕

iPhone 的 PWA 需要通过 `https://` 或本地开发服务器访问，不能只靠 `file://` 本地文件安装完整离线能力。

最简单的发布方式：

1. 把 `CowDesktopPetWeb` 文件夹上传到 GitHub。
2. 开启 GitHub Pages。
3. 用 iPhone Safari 打开 GitHub Pages 地址。
4. 点击 Safari 分享按钮。
5. 选择“添加到主屏幕”。

添加后，它会像普通 App 一样从主屏幕启动。

## 目前功能

- 奶牛会呼吸、摇尾巴、被摸头时跳一下。
- 可以喂草、摸头、睡觉、洗澡。
- 有饥饿、精力、亲密度状态。
- 状态会保存在本机浏览器里。
- 支持 PWA manifest 和 service worker 离线缓存。
