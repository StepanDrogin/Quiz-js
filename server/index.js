import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { createAttempt, getPublicQuiz } from "./store.js";

const PORT = Number(process.env.PORT || 3000);
const DIST_DIR = path.join(process.cwd(), "dist");
const MAX_BODY_SIZE = 128 * 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(payload));
}

function isInside(basePath, targetPath) {
  const relative = path.relative(basePath, targetPath);
  return Boolean(relative) && !relative.startsWith("..") && !path.isAbsolute(relative);
}

async function readJsonBody(request) {
  const chunks = [];
  let bodySize = 0;

  for await (const chunk of request) {
    bodySize += chunk.length;

    if (bodySize > MAX_BODY_SIZE) {
      const error = new Error("Request body is too large");
      error.statusCode = 413;
      throw error;
    }

    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function handleApi(request, response, pathname) {
  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      Allow: "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    });
    response.end();
    return;
  }

  if (request.method === "GET" && pathname === "/api/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && pathname === "/api/quiz") {
    sendJson(response, 200, await getPublicQuiz());
    return;
  }

  if (request.method === "POST" && pathname === "/api/attempts") {
    const payload = await readJsonBody(request);
    sendJson(response, 201, await createAttempt(payload));
    return;
  }

  sendJson(response, 404, { message: "API route not found" });
}

async function resolveStaticFile(pathname) {
  const safePath = decodeURIComponent(pathname.split("?")[0]);
  const requestedPath = safePath === "/" ? "/index.html" : safePath;
  const candidate = path.resolve(DIST_DIR, `.${requestedPath}`);

  if (!isInside(DIST_DIR, candidate)) {
    return null;
  }

  if (existsSync(candidate)) {
    const stats = await fs.stat(candidate);
    return stats.isDirectory() ? path.join(candidate, "index.html") : candidate;
  }

  return path.join(DIST_DIR, "index.html");
}

async function handleStatic(response, pathname) {
  if (!existsSync(DIST_DIR)) {
    sendJson(response, 404, {
      message: "Build directory is missing. Run npm run build first."
    });
    return;
  }

  const filePath = await resolveStaticFile(pathname);

  if (!filePath || !isInside(DIST_DIR, filePath) || !existsSync(filePath)) {
    sendJson(response, 404, { message: "File not found" });
    return;
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  response.writeHead(200, {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff"
  });
  response.end(await fs.readFile(filePath));
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const pathname = url.pathname;

    if (pathname.startsWith("/api/")) {
      await handleApi(request, response, pathname);
      return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { message: "Method not allowed" });
      return;
    }

    await handleStatic(response, pathname);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    sendJson(response, statusCode, {
      message: statusCode === 500 ? "Internal server error" : error.message
    });
  }
});

server.listen(PORT, () => {
  console.log(`Quiz Chat server is running on http://localhost:${PORT}`);
});
