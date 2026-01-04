const API_BASE = "https://qlasar-qx6y.onrender.com";

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const title = document.getElementById("qlasar-title");

const chatSection = document.getElementById("chat-section");
const alertsSection = document.getElementById("alerts-section");

const chatWindow = document.getElementById("chat-window");
const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("message-input");

const alertsList = document.getElementById("alerts-list");

// ================= SIDEBAR =================
title.onclick = () => {
  sidebar.style.left = "0";
  overlay.classList.add("show");
};

overlay.onclick = () => {
  closeSidebar();
};

function closeSidebar() {
  sidebar.style.left = "-260px";
  overlay.classList.remove("show");
}

// ================= WELCOME =================
function welcome() {
  chatSection.classList.remove("hidden");
  alertsSection.classList.add("hidden");

  chatWindow.innerHTML = "";
  const w = document.createElement("div");
  w.className = "message ai";
  w.innerText = "Hello! I’m Qlasar — ask me anything.";
  chatWindow.appendChild(w);
}
welcome();

// ================= MENU BUTTONS =================
document.getElementById("new-chat").onclick = () => {
  welcome();
  closeSidebar();
};

document.getElementById("show-alerts").onclick = () => {
  chatSection.classList.add("hidden");
  alertsSection.classList.remove("hidden");
  closeSidebar();
  loadAlerts();
};

document.getElementById("show-sessions").onclick = () =>
  alert("Session storage coming soon");

document.getElementById("account-btn").onclick = () =>
  alert("Auth coming soon");

// ================= CHAT SEND =================
sendBtn.onclick = send;

input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

async function send() {
  const text = input.value.trim();
  if (!text) return;

  // always switch back to chat view
  chatSection.classList.remove("hidden");
  alertsSection.classList.add("hidden");

  // user bubble
  const u = document.createElement("div");
  u.className = "message user";
  u.innerText = text;
  chatWindow.appendChild(u);

  input.value = "";

  // AI bubble (thinking)
  const a = document.createElement("div");
  a.className = "message ai";
  a.innerText = "Thinking…";
  chatWindow.appendChild(a);

  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ sender: "user", text }]
      })
    });

    if (!res.ok) {
      const raw = await res.text();
      console.error("Server error:", raw);
      a.innerText = "❌ Server error. Please try again.";
      return;
    }

    const data = await res.json();

    let reply = data?.reply || "";

    // remove <think> blocks if any model sends them
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    if (!reply) {
      a.innerText = "⚠️ No reply received.";
    } else {
      a.innerText = reply;
    }
  } catch (err) {
    console.error("Network error:", err);
    a.innerText = "🌐 Network error. Please try again.";
  }

  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ================= ALERTS LOADER =================
async function loadAlerts() {
  alertsList.innerHTML = "Loading...";

  try {
    const res = await fetch(`${API_BASE}/api/alerts`);

    if (!res.ok) {
      alertsList.innerHTML = "⚠️ Failed to load alerts";
      return;
    }

    const data = await res.json();
    alertsList.innerHTML = "";

    (data.alerts || []).forEach(a => {
      const card = document.createElement("div");
      card.className = "alert-card";
      card.innerHTML = `
        <strong>${a.title}</strong><br>
        <small>${a.source || ""}</small><br>
        <a href="${a.url}" target="_blank">Open</a>
      `;
      alertsList.appendChild(card);
    });

    if (!data.alerts || data.alerts.length === 0) {
      alertsList.innerHTML = "No alerts available.";
    }
  } catch (err) {
    console.error(err);
    alertsList.innerHTML = "⚠️ Network error loading alerts.";
  }
}
