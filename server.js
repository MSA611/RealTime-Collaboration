import url from "url";

import { createServer } from "http";
import { WebSocketServer } from "ws";

const server = createServer();

const rooms = new Map();
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const { query } = req.url;

  const roomId = query.room || "default";

  if (!rooms.has(roomId)) rooms.set(roomId, new Set());

  rooms.get(roomId).add(ws);

  console.log(`Client joined room: ${roomId}`);

  ws.on("message", (message) => {
    for (const client of rooms.get(roomId)) {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    }
  });

  ws.on("close", () => {
    rooms.get(roomId)?.delete(ws);
    if (rooms.get(roomId)?.size === 0) {
      rooms.delete(roomId);
    }
  });
});

server.listen(3000, () => {
  console.log("WebSocket server running on ws://localhost:3000");
});
