---
title: README
markmap:
  colorFreezeLevel: 2
comment: Go to `https://markmap.js.org/repl`.
---

# 项目结构

## 前端

- ==目录: 存储于项目根目录==
- 使用 `pnpm install` 安装依赖
- 使用 `pnpm run dev` 测试
- 使用 `pnpm build` 编译，生成的项目位于 `dist/` 目录下
- `src` 中存储源代码

## API 后端
- ==目录: `${PROJECT}/backend/api/`==
- 使用 `pnpm install` 安装依赖
- 使用 `pnpm start` 启动服务器
- `.env` 中配置设置内容

## 弹幕后端
- ==目录: `${PROJECT}/backend/danmu/`==
- 使用 `pnpm install` 安装依赖
- 使用 `pnpm start` 启动服务器
- `.env` 中配置设置内容

## Nginx 配置
- ==目录: `${PROJECT}/nginx-config`==
- 需要 `nginx-mod-rtmp`

# 部署

1. 在 `/opt` 新建项目根目录: `mkdir -p /opt/${PROJECT}`
2. 进入项目部署目录后，新建前端和后端：`mkdir api danmu frontend` 以及辅助目录：`mkdir data logs`
3. 将 `dist/` 目录下的编译产物推送到 `frontend`
4. 将 `backend/api/` 目录下的代码推送到 `api/`，然后通过 npm 或 pnpm 安装依赖
5. 将 `backend/danmu/` 目录下的代码推送到 `danmu/`，然后通过 npm 或 pnpm 安装依赖
6. 配置服务端 `/etc/nginx/nginx.conf`，并设置正确端口；
