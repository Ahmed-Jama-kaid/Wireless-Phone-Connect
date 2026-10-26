
const socket = io();

const qr = document.getElementById("qr");
const placeholder = document.getElementById("qrPlaceholder");
const createBtn = document.getElementById("createBtn");
const downloadBtn = document.getElementById("downloadBtn");
const exitBtn = document.getElementById("exitBtn");
const urlBox = document.getElementById("urlBox");
const deviceList = document.getElementById("deviceList");
const overallStatus = document.getElementById("overallStatus");

const SESSION_KEY = "wirelessPhoneConnectSession";
let current = null;

document.getElementById("themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("light");
});

function showSession(data) {
  current = data;

  qr.src = data.qr;
  qr.hidden = false;
  placeholder.hidden = true;
  downloadBtn.disabled = false;
  urlBox.textContent = data.url;
  overallStatus.textContent = "Restoring session…";

  socket.emit("pc:join", { room: data.token });
}

function restoreSession() {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (!saved) return;

    const data = JSON.parse(saved);

    if (data.token && data.url && data.qr) {
      showSession(data);
    }
  } catch (error) {
    console.error("Could not restore saved session:", error);
  }
}

createBtn.addEventListener("click", async () => {
  createBtn.disabled = true;

  try {
    const res = await fetch("/api/session");
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Could not create QR");
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    showSession(data);
    renderDevices([]);
    overallStatus.textContent = "Waiting for phone to join";
  } catch (error) {
    alert("Could not generate QR. Make sure the server is running.");
  } finally {
    createBtn.disabled = false;
  }
});

downloadBtn.addEventListener("click", () => {
  if (!current) return;

  const a = document.createElement("a");
  a.href = current.qr;
  a.download = "wireless-phone-connect-qr.png";
  a.click();
});

exitBtn.addEventListener("click", () => {
  // Jooji isticmaalka boggan, laakiin ha tirtirin session-ka kaydsan.
  overallStatus.textContent = "PC session saved. You can return later.";
  deviceList.innerHTML =
    '<div class="empty">Session saved. Reopen this page to reconnect.</div>';

  socket.disconnect();
});

socket.on("connect", () => {
  if (current) {
    socket.emit("pc:join", { room: current.token });
  }
});

socket.on("devices:list", (devices) => {
  renderDevices(devices);
});

socket.on("phone:status", ({ status }) => {
  overallStatus.textContent = `Phone status: ${status}`;
});

function renderDevices(devices) {
  if (!devices.length) {
    deviceList.innerHTML =
      '<div class="empty">No phone connected yet.</div>';
    return;
  }

  deviceList.innerHTML = devices.map((d) => {
    const online = d.status === "Connected";

    return `
      <div class="device">
        <div class="phone-icon">📱</div>
        <div class="meta">
          <b>${escapeHtml(d.label || "Android phone")}</b>
          <small>Last seen: ${
            d.lastSeen
              ? new Date(d.lastSeen).toLocaleString()
              : "Just now"
          }</small>
        </div>
        <span class="pill ${online ? "" : "offline"}">
          ${online ? "Connected" : "Offline"}
        </span>
      </div>
    `;
  }).join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

// Marka PC-ga bogga dib u furo, soo celi session-kii hore.
restoreSession();
