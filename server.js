const http = require("http");
const fs = require("fs");
const path = require("path");
const portfolioData = require("./data");

const DEFAULT_PORT = Number(process.env.PORT) || 3000;
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
  ".ico": "image/x-icon"
};

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

function serveFile(response, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(response, 404, { error: "Arquivo nao encontrado" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  const url = request.url || "/";

  if (url === "/api/portfolio") {
    sendJson(response, 200, portfolioData);
    return;
  }

  const safePath = url === "/" ? "index.html" : url.replace(/^\//, "");
  const filePath = path.join(baseDir, safePath);

  if (!filePath.startsWith(baseDir)) {
    sendJson(response, 403, { error: "Acesso negado" });
    return;
  }

  serveFile(response, filePath);
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
