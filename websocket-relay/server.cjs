const http = require("http");
const { setupWSConnection } = require("y-websocket/bin/utils");
const WebSocket = require("ws");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  setupWSConnection(ws, req);
});

server.listen(1234, () => {
  console.log("Yjs WebSocket server running on ws://localhost:1234");
});