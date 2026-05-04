# AnyRouter Proxy

基于 Cloudflare Workers 的代理服务，支持 SSE 流式响应透传。

## 功能特性

- **代理转发**：将请求转发到 anyrouter.top
- **SSE 流式支持**：支持 Server-Sent Events 流式响应透传
- **健康检查**：提供 `/health` 端点
- **请求日志**：记录请求和响应日志（包括时间戳、方法、路径、状态码、耗时）

## 安装

```bash
bun install
```

## 配置

### 自定义域名（可选）

在 `wrangler.toml` 中取消注释并配置自定义域名：

```toml
routes = [
  { pattern = "your-domain.example.com", zone_name = "example.com" }
]
```

## 开发

```bash
bun run dev
```

## 部署

```bash
bun run deploy
```

## 类型生成

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```bash
bun run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```
