import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow connections from any origin (for development)
    methods: ["GET", "POST"],
  },
});

const documents = {};

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);
  socket.on("join-document", (documentId) => {
    socket.join(documentId);
    console.log(`User ${socket.id} joined document ${documentId}`);
    if (!documents[documentId]) {
      documents[documentId] = {
        id: documentId,
        content: "", // Start with empty content
      };
    }

    socket.emit("load-document", documents[documentId].content);
    socket.on("code-change", (newContent) => {
      documents[documentId].content = newContent;
      socket.to(documentId).emit("code-updated", newContent);
    });
  });

  // Event listener for when a user disconnects
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// --- Basic Express Route ---
app.get("/", (req, res) => {
  res.send("Collaborative Editor Backend is running!");
});

// --- Start the Server ---
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
