import { Server } from "socket.io";
import http from "http";
import express from "express";
import path from "path";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  // Serve static files from the Frontend/dist directory
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));

  // Serve the index.html file for non-asset routes (SPA support)
  app.get("*", (req, res, next) => {
    // Don't serve index.html for asset requests
    // if (req.path.includes('.')) {
    //   return next();
    // }
    res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
  });
}

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", ({ roomId, username }) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { users: [], code: "" };
    }

    const existingUser = rooms[roomId].users.find(
      (u) => u.socketId === socket.id,
    );
    if (!existingUser) {
      rooms[roomId].users.push({ socketId: socket.id, username });

      socket.to(roomId).emit("userJoined", username);
    }

    socket.emit("codeUpdate", rooms[roomId].code);
    io.to(roomId).emit("userListUpdate", rooms[roomId].users);
  });

  socket.on("leaveRoom", ({ roomId, username }) => {
    const user = rooms[roomId]?.users.find((u) => u.socketId === socket.id);
    if (user) {
      rooms[roomId].users = rooms[roomId].users.filter(
        (u) => u.socketId !== socket.id,
      );

      socket.to(roomId).emit("userLeft", username);
      io.to(roomId).emit("userListUpdate", rooms[roomId].users);

      socket.leave(roomId);
    }
  });

  socket.on("codeChange", ({ roomId, code }) => {
    if (rooms[roomId]) {
      rooms[roomId].code = code;
      socket.to(roomId).emit("codeUpdate", code);
    }
  });

  socket.on("disconnect", () => {
    for (let roomId in rooms) {
      const user = rooms[roomId].users.find((u) => u.socketId === socket.id);
      if (user) {
        rooms[roomId].users = rooms[roomId].users.filter(
          (u) => u.socketId !== socket.id,
        );

        socket.to(roomId).emit("userLeft", user.username);
        io.to(roomId).emit("userListUpdate", rooms[roomId].users);
        break;
      }
    }
  });
});

const PORT = process.env.port || 5001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
