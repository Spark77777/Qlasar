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

// ================= CREDITS =================
const creditsBar = document.getElementById("credits-bar");

function updateCreditsVisibility() {
  const token = localStorage.getItem("qlasar_token");
  token ? creditsBar.classList.remove("hidden") : creditsBar.classList.add("hidden");
}

const qcCountEl = document.getElementById("qc-count");
const saCountEl = document.getElementById("sa-count");

function getCredits() {
  return {
    qc: parseInt(localStorage.getItem("qc") || "200"),
    sa: parseInt(localStorage.getItem("sa") || "5")
  };
}

function saveCredits(qc, sa) {
  localStorage.setItem("qc", qc);
  localStorage.setItem("sa", sa);
  renderCredits();
}

function renderCredits() {
  const { qc, sa } = getCredits();
  qcCountEl.innerText = qc;
  saCountEl.innerText = sa;
}

function consumeQC(amount = 1) {
  const { qc, sa } = getCredits();
  if (qc < amount) return false;
  saveCredits(qc - amount, sa);
  return true;
}

function consumeSA(amount = 1) {
  const { qc, sa } = getCredits();
  if (sa < amount) return false;
  saveCredits(qc, sa - amount);
  return true;
}

// ================= SESSIONS =================
const sessionsPanel = document.getElementById("sessions-panel");
const sessionsPanelList = document.getElementById("sessions-panel-list");

let currentSessionId = null;

// ================= CREATE SESSION =================
async function createNewSession() {
  const token = localStorage.getItem("qlasar_token");
  if (!token) return alert("Please login to start using Qlasar.");

  const res = await fetch(`${API_BASE}/api/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title: "New chat" })
  });

  const data = await res.json();
  currentSessionId = data.id;
  welcome();
  renderSessionsList();
}

// ================= LOAD SESSION =================
async function loadSession(id) {
  const token = localStorage.getItem("qlasar_token");
  if (!token) return;

  currentSessionId = id;

  const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  chatWindow.innerHTML = "";
  (data.messages || []).forEach(m => {
    const div = document.createElement("div");
    div.className = `message ${m.sender}`;
    div.innerText = m.text;
    chatWindow.appendChild(div);
  });

  chatSection.classList.remove("hidden");
  alertsSection.classList.add("hidden");
  renderSessionsList();
}

// ================= SIDEBAR =================
title.onclick = () => {
  sidebar.classList.toggle("show");
  overlay.classList.toggle("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("show");
  overlay.classList.remove("show");
};

// ================= WELCOME =================
function welcome() {
  chatWindow.innerHTML = "";
  const w = document.createElement("div");
  w.className = "message ai";
  w.innerText = "Hello! I’m Qlasar — ask me anything.";
  chatWindow.appendChild(w);
}

welcome();

// ================= SESSIONS LIST (UPDATED) =================
async function renderSessionsList() {
  sessionsPanelList.innerHTML = "Loading...";
  const token = localStorage.getItem("qlasar_token");
  if (!token) return sessionsPanelList.innerHTML = "Login to view saved sessions.";

  const res = await fetch(`${API_BASE}/api/sessions`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const sessions = await res.json();
  sessionsPanelList.innerHTML = "";

  sessions.forEach(s => {
    const pill = document.createElement("div");
    pill.className = "session-pill";

    const row = document.createElement("div");
    row.className = "session-row";

    const titleSpan = document.createElement("span");
    titleSpan.textContent = "💬 " + (s.title || "Untitled chat");
    titleSpan.onclick = () => loadSession(s.id);

    if (s.id === currentSessionId) {
      pill.classList.add("active-session");
    }

    const actions = document.createElement("div");
    actions.className = "session-actions";

    // ✏️ Rename
    const renameBtn = document.createElement("button");
    renameBtn.className = "session-action-btn";
    renameBtn.textContent = "✏️";
    renameBtn.onclick = async e => {
      e.stopPropagation();
      const newTitle = prompt("Rename session:", s.title);
      if (!newTitle) return;

      await fetch(`${API_BASE}/api/sessions/${s.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle.trim() })
      });

      renderSessionsList();
    };

    // 🗑️ Delete
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "session-action-btn";
    deleteBtn.textContent = "🗑️";
    deleteBtn.onclick = async e => {
      e.stopPropagation();
      if (!confirm("Delete this session permanently?")) return;

      await fetch(`${API_BASE}/api/sessions/${s.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (currentSessionId === s.id) {
        currentSessionId = null;
        welcome();
      }

      renderSessionsList();
    };

    actions.append(renameBtn, deleteBtn);
    row.append(titleSpan, actions);
    pill.appendChild(row);
    sessionsPanelList.appendChild(pill);
  });
}

// ================= ALERTS =================
document.getElementById("show-alerts").onclick = () => {
  if (!consumeSA(1)) return alert("⚠️ You have 0 SA left.");
  chatSection.classList.add("hidden");
  alertsSection.classList.remove("hidden");
  loadAlerts();
};

// ================= CHAT SEND =================
function bindSendEvents() {
  async function send() {
    const text = input.value.trim();
    if (!text) return;

    if (!consumeQC(1)) return alert("⚠️ You have 0 QC left.");

    if (!currentSessionId) await createNewSession();

    const u = document.createElement("div");
    u.className = "message user";
    u.innerText = text;
    chatWindow.appendChild(u);

    const a = document.createElement("div");
    a.className = "message ai";
    a.innerText = "Thinking…";
    chatWindow.appendChild(a);

    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ sender: "user", text }] })
    });

    const data = await res.json();
    a.innerText = data.reply || "Error.";

    const token = localStorage.getItem("qlasar_token");
    await fetch(`${API_BASE}/api/sessions/${currentSessionId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sender: "user", text })
    });

    await fetch(`${API_BASE}/api/sessions/${currentSessionId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sender: "ai", text: data.reply })
    });
  }

  sendBtn.onclick = send;
  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindSendEvents();
  updateCreditsVisibility();
  renderCredits();
});
