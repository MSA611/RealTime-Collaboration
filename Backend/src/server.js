// server.js
import { Server } from "socket.io";
import http from "http";

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  // user typing -> broadcast lock
  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("lockEditor", { userId: socket.id });
  });

  // stop typing -> unlock
  socket.on("stopTyping", (roomId) => {
    socket.to(roomId).emit("unlockEditor", { userId: socket.id });
  });

  // send code changes
  socket.on("codeChange", ({ roomId, code }) => {
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(5001, () => console.log("Server running on 5001"));
