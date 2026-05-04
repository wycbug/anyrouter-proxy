# AnyRouter Proxy

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)
[![Hono](https://img.shields.io/badge/Hono-v4.12.16-red)](https://hono.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

A high-performance proxy service built on Cloudflare Workers with support for SSE (Server-Sent Events) streaming response forwarding.

## 🌟 Features

- **Proxy Forwarding**: Seamlessly forwards requests to anyrouter.top
- **SSE Streaming Support**: Full support for Server-Sent Events streaming response passthrough
- **Health Check**: Built-in `/health` endpoint for service monitoring
- **Request Logging**: Comprehensive logging with timestamps, methods, paths, status codes, and duration
- **Header Management**: Intelligent header filtering and forwarding
- **Cloudflare Integration**: Leverages Cloudflare's global edge network
- **TypeScript Support**: Fully typed for better development experience

## 🏗️ Architecture

This proxy service is built with:

- **Runtime**: Cloudflare Workers (Edge computing)
- **Framework**: Hono (Lightweight web framework)
- **Language**: TypeScript
- **Package Manager**: Bun

The service acts as a transparent proxy that forwards all requests to the upstream server (`anyrouter.top`) while preserving streaming responses for SSE connections.

## 📦 Installation

### Prerequisites

- [Bun](https://bun.sh/) - Package manager and runtime
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) - Cloudflare Workers CLI
- Cloudflare account with Workers enabled

### Setup

```bash
# Clone the repository
git clone https://github.com/wycbug/anyrouter-proxy.git
cd anyrouter-proxy

# Install dependencies
bun install

# Login to Cloudflare
npx wrangler login
```

## ⚙️ Configuration

### Environment Variables

Create a `.dev.vars` file for local development (see `.dev.vars.example` for reference):

```bash
# Copy the example file
cp .dev.vars.example .dev.vars
```

### Custom Domain (Optional)

Configure your custom domain in `wrangler.toml`:

```toml
routes = [
  { pattern = "your-domain.example.com", zone_name = "example.com" }
]
```

### Observability

The service includes built-in observability features enabled by default:

```toml
[observability]
enabled = true
```

## 🚀 Development

### Local Development

Start the local development server:

```bash
bun run dev
```

The service will be available at `http://localhost:8787`

### Health Check

Test the health endpoint:

```bash
curl http://localhost:8787/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2026-05-04T15:21:00.000Z"
}
```

## 🌐 Deployment

### Deploy to Cloudflare Workers

```bash
bun run deploy
```

This will deploy your worker to Cloudflare's global network with minification enabled.

### Type Generation

Generate TypeScript types based on your Worker configuration:

```bash
bun run cf-typegen
```

Use the generated types in your code:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```

## 📝 API Reference

### Health Check

**Endpoint**: `GET /health`

**Response**:

```json
{
  "status": "ok",
  "timestamp": "ISO-8601 timestamp"
}
```

### Proxy Endpoint

**Endpoint**: `ALL *`

**Behavior**: Forwards all requests to the upstream server (`anyrouter.top`)

**Features**:

- Preserves HTTP method
- Forwards request headers (except `host` and `content-length`)
- Supports streaming responses for SSE
- Returns appropriate status codes
- Logs all requests and responses

## 🔒 Security

- Headers filtering: Automatically filters sensitive headers like `host` and `content-length`
- Content-Type protection: Sets `X-Content-Type-Options: nosniff` for SSE responses
- No caching: SSE responses set `Cache-Control: no-cache`
- Error handling: Graceful error handling with appropriate HTTP status codes

## 📊 Logging

The service provides detailed logging including:

- Request timestamp (ISO-8601 format)
- HTTP method
- Request path
- Stream indicator (for SSE requests)
- Response status code
- Request duration (milliseconds)
- Error messages (if any)

Example log output:

```
[2026-05-04T15:21:00.000Z] GET /api/stream [STREAM]
[2026-05-04T15:21:01.234Z] GET /api/stream 200 1234ms [STREAM]
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Hono](https://hono.dev/)
- Powered by [Cloudflare Workers](https://workers.cloudflare.com/)
- Package management by [Bun](https://bun.sh/)

## 📧 Contact

For questions or suggestions, please open an issue on GitHub.
