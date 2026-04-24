const path = require("path");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  transports: ["websocket"],
  pingInterval: 25000,
  pingTimeout: 60000
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

// ✅ ADD THIS
app.get("/.well-known/discord", (req, res) => {
  res.type("text/plain");
  res.send("dh=9ce1c318ee5f6678ac1731ff464fe246fdc66c00");
});

io.on("connection", (socket) => {
  socket.on("chat message", (payload) => {
    if (!payload || typeof payload.text !== "string") return;

    const text = payload.text.trim().slice(0, 500);
    if (!text) return;

    const rawName = typeof payload.name === "string" ? payload.name : "Guest";
    const name = rawName.trim().slice(0, 24) || "Guest";

    io.emit("chat message", {
      senderId: socket.id,
      name,
      text,
      at: new Date().toISOString()
    });
  });
});

server.listen(PORT, () => {
  console.log(`Chat server listening on port ${PORT}`);
});