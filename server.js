const http = require("http");
const fs = require("fs");
const path = require("path");
const portfolioData = require("./data");

const DEFAULT_PORT = Number(process.env.PORT) || 4000;
const baseDir = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf"
};

function getSecurityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Content-Security-Policy":
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self'; frame-src https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
  };
}

function sendJson(response, statusCode, data, cacheControl = "no-store") {
  response.writeHead(statusCode, {
    ...getSecurityHeaders(),
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": cacheControl
  });
  response.end(JSON.stringify(data));
}

function getCacheControl(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".html") return "no-cache";
  if (ext === ".css" || ext === ".js" || ext === ".json") {
    return "public, max-age=3600";
  }
  if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".svg" || ext === ".ico" || ext === ".pdf") {
    return "public, max-age=604800";
  }

  return "public, max-age=3600";
}

function serveFile(response, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(response, 404, { error: "Arquivo nao encontrado" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    response.writeHead(200, {
      ...getSecurityHeaders(),
      "Content-Type": contentType,
      "Cache-Control": getCacheControl(filePath)
    });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { error: "Metodo nao permitido" });
    return;
  }

  let pathname = "/";
  try {
    const parsedUrl = new URL(request.url || "/", "http://localhost");
    pathname = decodeURIComponent(parsedUrl.pathname);
  } catch {
    sendJson(response, 400, { error: "URL invalida" });
    return;
  }

  if (pathname === "/api/portfolio") {
    sendJson(response, 200, portfolioData, "public, max-age=300");
    return;
  }

  const safePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const resolvedPath = path.resolve(baseDir, safePath);
  const baseDirWithSep = baseDir.endsWith(path.sep) ? baseDir : `${baseDir}${path.sep}`;

  if (
    !resolvedPath.startsWith(baseDirWithSep) &&
    resolvedPath !== baseDir
  ) {
    sendJson(response, 403, { error: "Acesso negado" });
    return;
  }

  if (path.basename(resolvedPath).startsWith(".")) {
    sendJson(response, 403, { error: "Acesso negado" });
    return;
  }

  serveFile(response, resolvedPath);
});

function startServer(initialPort) {
  let currentPort = initialPort;

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      currentPort += 1;
      server.listen(currentPort);
      return;
    }

    console.error("Erro ao iniciar servidor:", error);
    process.exit(1);
  });

  server.on("listening", () => {
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : currentPort;
    console.log(`Servidor rodando em http://localhost:${port}`);
  });

  server.listen(currentPort);
}

startServer(DEFAULT_PORT);
