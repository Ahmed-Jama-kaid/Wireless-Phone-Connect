// Wireless Phone Connect — minimal Node.js server (no Python)
// Run: npm install && npm start
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const QRCode = require("qrcode");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/api/session", async (_req, res) => {
  const token = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const base = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
  const url = `${base}/phone.html?room=${token}`;
  try {
    const qr = await QRCode.toDataURL(url, { width: 360, margin: 2 });
    res.json({ token, url, qr });
  } catch {
    res.status(500).json({ error: "QR generation failed" });
  }
});

const devices = new Map(); // session room -> last known device metadata
io.on("connection", (socket) => {
  socket.on("pc:join", ({ room }) => {
    if (!room) return;
    socket.join(room);
    socket.data.room = room;
    socket.data.role = "pc";
    socket.emit("devices:list", [...devices.entries()].filter(([key]) => key === room).map(([key, value]) => ({ room: key, ...value })));
  });

  socket.on("phone:join", ({ room, label }) => {
    if (!room) return;
    socket.join(room);
    socket.data.room = room;
    socket.data.role = "phone";
    const old = devices.get(room) || {};
    devices.set(room, { label: String(label || "Android phone").slice(0, 50), status: "Connected", lastSeen: new Date().toISOString() });
    io.to(room).emit("devices:list", [{ room, ...devices.get(room) }]);
    io.to(room).emit("phone:status", { status: "Connected" });
  });

  socket.on("phone:heartbeat", () => {
    const room = socket.data.room;
    if (!room || socket.data.role !== "phone") return;
    const old = devices.get(room) || { label: "Android phone" };
    devices.set(room, { ...old, status: "Connected", lastSeen: new Date().toISOString() });
    io.to(room).emit("devices:list", [{ room, ...devices.get(room) }]);
  });

  socket.on("disconnect", () => {
    const room = socket.data.room;
    if (room && socket.data.role === "phone") {
      const old = devices.get(room) || { label: "Android phone" };
      devices.set(room, { ...old, status: "Offline", lastSeen: new Date().toISOString() });
      io.to(room).emit("devices:list", [{ room, ...devices.get(room) }]);
      io.to(room).emit("phone:status", { status: "Offline" });
    }
  });
});

server.listen(PORT, () => console.log(`Wireless Phone Connect running at http://localhost:${PORT}`));
