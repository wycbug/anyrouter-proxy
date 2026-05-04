import { Hono } from "hono";

const app = new Hono();

// 上游服务器地址
const UPSTREAM = "https://anyrouter.top";

// 检测是否为 SSE 请求
function isSSERequest(headers: Headers): boolean {
  const accept = headers.get("accept") || "";
  return accept.includes("text/event-stream");
}

// 构建转发请求的 headers
function buildProxyHeaders(originalHeaders: Headers): Headers {
  const headers = new Headers();
  originalHeaders.forEach((value, key) => {
    // 跳过一些不应该转发的 headers
    if (!["host", "content-length"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  return headers;
}

// 记录请求日志
function logRequest(method: string, path: string, isStream: boolean) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path} ${isStream ? "[STREAM]" : ""}`);
}

// 记录响应日志
function logResponse(
  method: string,
  path: string,
  status: number,
  duration: number,
  isStream: boolean,
) {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${method} ${path} ${status} ${duration}ms ${isStream ? "[STREAM]" : ""}`,
  );
}

// 记录错误日志
function logError(method: string, path: string, error: string) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${method} ${path} ERROR: ${error}`);
}

// 健康检测端点
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// SSE 流式代理 - 直接透传流式响应
app.all("*", async (c) => {
  const startTime = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const query = c.req.url.split("?")[1] || "";
  const upstreamUrl = `${UPSTREAM}${path}${query ? "?" + query : ""}`;

  // 检测是否为流式请求
  const isStream = isSSERequest(c.req.raw.headers);

  // 记录请求开始
  logRequest(method, path, isStream);

  // 获取原始请求的所有 headers
  const headers = buildProxyHeaders(c.req.raw.headers);

  // 构建转发请求
  const upstreamReq = new Request(upstreamUrl, {
    method: c.req.method,
    headers,
    body: ["GET", "HEAD"].includes(c.req.method)
      ? undefined
      : await c.req.arrayBuffer(),
    // 传递原始请求的 cf 属性（Cloudflare 特定）
    cf: c.req.raw.cf,
    // 重要：保持流式响应
    duplex: "half",
  });

  // 发送请求到上游
  let res;
  try {
    res = await fetch(upstreamReq);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logError(method, path, errMsg);
    return new Response("Upstream request failed", { status: 502 });
  }

  // 检测上游响应是否为 SSE 流
  const contentType = res.headers.get("content-type") || "";

  // 如果是 SSE 流，直接透传流式响应
  if (contentType.includes("text/event-stream") || isStream) {
    // 获取上游流式响应
    const stream = res.body;

    if (!stream) {
      logError(method, path, "No stream content");
      return new Response("No content", { status: 502 });
    }

    // 记录响应
    const duration = Date.now() - startTime;
    logResponse(method, path, res.status, duration, true);

    // 透传流式响应
    return new Response(stream, {
      status: res.status,
      headers: {
        "Content-Type": contentType || "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  // 普通请求 - 保留原有逻辑
  const responseHeaders = new Headers();
  res.headers.forEach((value, key) => {
    // 保留重要的响应 headers
    if (
      !["content-encoding", "content-length", "transfer-encoding"].includes(
        key.toLowerCase(),
      )
    ) {
      responseHeaders.set(key, value);
    }
  });

  // 记录响应
  const duration = Date.now() - startTime;
  logResponse(method, path, res.status, duration, false);

  // 返回响应
  return new Response(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
});

export default app;
