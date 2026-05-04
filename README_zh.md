# AnyRouter Proxy

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-v4.12.16-red)](https://hono.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

基于 Cloudflare Workers 构建的高性能代理服务，支持 SSE（Server-Sent Events）流式响应转发。

## 🌟 功能特性

- **代理转发**：无缝转发请求到 anyrouter.top
- **SSE 流式支持**：完整支持 Server-Sent Events 流式响应透传
- **健康检查**：内置 `/health` 端点用于服务监控
- **请求日志**：全面的日志记录，包括时间戳、方法、路径、状态码和耗时
- **请求头管理**：智能的请求头过滤和转发
- **Cloudflare 集成**：利用 Cloudflare 全球边缘网络
- **TypeScript 支持**：完全类型化，提供更好的开发体验

## 🏗️ 架构

本代理服务使用以下技术栈构建：

- **运行时**：Cloudflare Workers（边缘计算）
- **框架**：Hono（轻量级 Web 框架）
- **语言**：TypeScript
- **包管理器**：Bun

该服务作为一个透明代理，将所有请求转发到上游服务器（`anyrouter.top`），同时为 SSE 连接保留流式响应。

## 📦 安装

### 前置要求

- [Bun](https://bun.sh/) - 包管理器和运行时
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) - Cloudflare Workers CLI
- 启用了 Workers 的 Cloudflare 账户

### 设置

```bash
# 克隆仓库
git clone https://github.com/wycbug/anyrouter-proxy.git
cd anyrouter-proxy

# 安装依赖
bun install

# 登录 Cloudflare
npx wrangler login
```

## ⚙️ 配置

### 环境变量

创建 `.dev.vars` 文件用于本地开发（参考 `.dev.vars.example`）：

```bash
# 复制示例文件
cp .dev.vars.example .dev.vars
```

### 自定义域名（可选）

在 `wrangler.toml` 中配置自定义域名：

```toml
routes = [
  { pattern = "your-domain.example.com", zone_name = "example.com" }
]
```

### 可观测性

服务默认启用内置的可观测性功能：

```toml
[observability]
enabled = true
```

## 🚀 开发

### 本地开发

启动本地开发服务器：

```bash
bun run dev
```

服务将在 `http://localhost:8787` 上可用

### 健康检查

测试健康端点：

```bash
curl http://localhost:8787/health
```

预期响应：

```json
{
  "status": "ok",
  "timestamp": "2026-05-04T15:21:00.000Z"
}
```

## 🌐 部署

### 部署到 Cloudflare Workers

```bash
bun run deploy
```

这将启用代码压缩并将你的 Worker 部署到 Cloudflare 的全球网络。

### 类型生成

根据 Worker 配置生成 TypeScript 类型：

```bash
bun run cf-typegen
```

在代码中使用生成的类型：

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```

## 📝 API 参考

### 健康检查

**端点**：`GET /health`

**响应**：

```json
{
  "status": "ok",
  "timestamp": "ISO-8601 时间戳"
}
```

### 代理端点

**端点**：`ALL *`

**行为**：将所有请求转发到上游服务器（`anyrouter.top`）

**功能**：

- 保留 HTTP 方法
- 转发请求头（除 `host` 和 `content-length` 外）
- 支持 SSE 流式响应
- 返回适当的状态码
- 记录所有请求和响应

## 🔒 安全性

- 请求头过滤：自动过滤敏感请求头如 `host` 和 `content-length`
- 内容类型保护：为 SSE 响应设置 `X-Content-Type-Options: nosniff`
- 无缓存：SSE 响应设置 `Cache-Control: no-cache`
- 错误处理：优雅的错误处理，返回适当的 HTTP 状态码

## 📊 日志

服务提供详细的日志记录，包括：

- 请求时间戳（ISO-8601 格式）
- HTTP 方法
- 请求路径
- 流式指示器（用于 SSE 请求）
- 响应状态码
- 请求持续时间（毫秒）
- 错误消息（如有）

日志输出示例：

```
[2026-05-04T15:21:00.000Z] GET /api/stream [STREAM]
[2026-05-04T15:21:01.234Z] GET /api/stream 200 1234ms [STREAM]
```

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 仓库
2. 创建你的特性分支（`git checkout -b feature/amazing-feature`）
3. 提交更改（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 打开 Pull Request

## 📄 许可证

本项目是开源的，采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

- 使用 [Hono](https://hono.dev/) 构建
- 由 [Cloudflare Workers](https://workers.cloudflare.com/) 提供支持
- 包管理由 [Bun](https://bun.sh/) 提供

## 📧 联系方式

如有问题或建议，请在 GitHub 上提交 issue。
