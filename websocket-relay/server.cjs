const http = require("http");
const { setupWSConnection } = require("y-websocket/bin/utils");
const WebSocket = require("ws");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  const room = req.url;
  console.log(`[connect] room=${room} totalClients=${wss.clients.size}`);

  ws.on("close", () => {
    console.log(`[disconnect] room=${room} totalClients=${wss.clients.size - 1}`);
  });

  setupWSConnection(ws, req);
});

server.listen(1234, () => {
  console.log("Yjs WebSocket server running on ws://localhost:1234");
});