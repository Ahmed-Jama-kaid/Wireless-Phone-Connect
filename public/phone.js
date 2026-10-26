const socket = io();
const params = new URLSearchParams(location.search);
const room = params.get("room");
const joinBtn = document.getElementById("joinBtn");
const status = document.getElementById("phoneStatus");

if (!room) {
  status.textContent = "Invalid QR: no session ID was provided.";
  joinBtn.disabled = true;
}
joinBtn.addEventListener("click", () => {
  if (!room) return;
  const label = document.getElementById("deviceName").value.trim() || "Android phone";
  socket.emit("phone:join", { room, label });
  status.textContent = "Connecting…";
  joinBtn.disabled = true;
});
socket.on("phone:status", ({status: s}) => {
  status.textContent = `Connection status: ${s}`;
});
setInterval(() => {
  if (socket.connected && room && joinBtn.disabled) socket.emit("phone:heartbeat");
}, 10000);
socket.on("connect", () => { if (room && joinBtn.disabled) socket.emit("phone:join", {room, label: document.getElementById("deviceName").value.trim() || "Android phone"}); });
