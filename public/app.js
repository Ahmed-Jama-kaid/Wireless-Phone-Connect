const socket = io();
const qr = document.getElementById("qr");
const placeholder = document.getElementById("qrPlaceholder");
const createBtn = document.getElementById("createBtn");
const downloadBtn = document.getElementById("downloadBtn");
const exitBtn = document.getElementById("exitBtn");
const urlBox = document.getElementById("urlBox");
const deviceList = document.getElementById("deviceList");
const overallStatus = document.getElementById("overallStatus");
let current = null;

document.getElementById("themeBtn").addEventListener("click", () => document.body.classList.toggle("light"));

createBtn.addEventListener("click", async () => {
  createBtn.disabled = true;
  try {
    const res = await fetch("/api/session");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not create QR");
    current = data;
    qr.src = data.qr;
    qr.hidden = false;
    placeholder.hidden = true;
    downloadBtn.disabled = false;
    urlBox.textContent = data.url;
    overallStatus.textContent = "Waiting for phone to join";
    socket.emit("pc:join", { room: data.token });
    renderDevices([]);
  } catch (e) {
    alert("Could not generate QR. Make sure the server is running.");
  } finally { createBtn.disabled = false; }
});

downloadBtn.addEventListener("click", () => {
  if (!current) return;
  const a = document.createElement("a");
  a.href = current.qr; a.download = "wireless-phone-connect-qr.png"; a.click();
});

exitBtn.addEventListener("click", () => {
  if (current) socket.emit("pc:exit", { room: current.token });
  socket.disconnect();
  overallStatus.textContent = "Stopped from PC";
  deviceList.innerHTML = '<div class="empty">Session stopped from the PC.</div>';
  createBtn.disabled = false;
});

socket.on("devices:list", (devices) => renderDevices(devices));
socket.on("phone:status", ({status}) => overallStatus.textContent = `Phone status: ${status}`);

function renderDevices(devices) {
  if (!devices.length) {
    deviceList.innerHTML = '<div class="empty">No phone connected yet.</div>';
    return;
  }
  deviceList.innerHTML = devices.map(d => {
    const online = d.status === "Connected";
    return `<div class="device"><div class="phone-icon">📱</div><div class="meta"><b>${escapeHtml(d.label || "Android phone")}</b><small>Last seen: ${d.lastSeen ? new Date(d.lastSeen).toLocaleString() : "Just now"}</small></div><span class="pill ${online ? "" : "offline"}">${online ? "Connected" : "Offline"}</span></div>`;
  }).join("");
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
