
const socket = io();

const params = new URLSearchParams(location.search);
const room = params.get("room");

const joinBtn = document.getElementById("joinBtn");
const status = document.getElementById("phoneStatus");
const deviceName = document.getElementById("deviceName");

const savedNameKey = `phoneName_${room}`;

if (room && localStorage.getItem(savedNameKey)) {
  deviceName.value = localStorage.getItem(savedNameKey);
}

if (!room) {
  status.textContent = "Invalid QR: no session ID was provided.";
  joinBtn.disabled = true;
}

function joinPhone() {
  if (!room || !socket.connected) return;

  const label = deviceName.value.trim() || "Android phone";

  localStorage.setItem(savedNameKey, label);

  joinBtn.disabled = true;
  status.textContent = "Connecting…";

  socket.emit("phone:join", {
    room,
    label
  });
}

joinBtn.addEventListener("click", joinPhone);

socket.on("phone:status", ({ status: s }) => {
  status.textContent = `Connection status: ${s}`;
});

socket.on("connect", () => {
  if (!room) return;

  // Dib ugu xirmo isla room-kii, adigoon QR cusub scan-garayn.
  joinPhone();
});

socket.on("disconnect", () => {
  if (room) {
    status.textContent = "Disconnected. Reconnecting…";
    joinBtn.disabled = false;
  }
});

setInterval(() => {
  if (socket.connected && room && joinBtn.disabled) {
    socket.emit("phone:heartbeat");
  }
}, 10000);
