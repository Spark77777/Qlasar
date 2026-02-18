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

// ✅ NEW — credits bar element
const creditsBar = document.getElementById("credits-bar");

// ✅ NEW — update credits visibility helper
function updateCreditsVisibility() {
  const token = localStorage.getItem("qlasar_token");
  if (token) {
    creditsBar.classList.remove("hidden");
  } else {
    creditsBar.classList.add("hidden");
  }
}

// Helper function for API requests
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("qlasar_token");
  const headers = options.headers || {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    return await res.json();
  } catch (err) {
    console.error(`Error during API request to ${endpoint}:`, err);
    throw err;
  }
}

// ================= INTEGRATED (1) — Credits DOM + logic
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
  let { qc, sa } = getCredits();
  if (qc < amount) return false;
  qc -= amount;
  saveCredits(qc, sa);
  return true;
}

function consumeSA(amount = 1) {
  let { qc, sa } = getCredits();
  if (sa < amount) return false;
  sa -= amount;
  saveCredits(qc, sa);
  return true;
}

// ===================== SESSION STATE ======================
let currentSessionId = null;

// ================= CREATE NEW SESSION (CLOUD ONLY) =================
async function createNewSession() {
  const token = localStorage.getItem("qlasar_token");
  if (!token) {
    alert("Please login to start using Qlasar.");
    return;
  }

  try {
    const data = await apiRequest("/api/sessions", {
      method: "POST",
      body: JSON.stringify({ title: "New chat" }),
      headers: { "Content-Type": "application/json" }
    });
    currentSessionId = data.id;
    welcome();
    renderSessionsList();
  } catch (err) {
    alert("Failed to create session. Please try again.");
  }
}

// ================= LOAD SESSION (CLOUD) =================
async function loadSession(id) {
  const token = localStorage.getItem("qlasar_token");
  if (!token) return;

  currentSessionId = id;

  try {
    const data = await apiRequest(`/api/sessions/${id}`, {
      headers: {}
    });
    chatWindow.innerHTML = "";
    sessionsPanel.classList.remove("show");
    (data.messages || []).forEach(m => {
      const div = document.createElement("div");
      div.className = `message ${m.sender}`;
      div.innerText = m.text;
      chatWindow.appendChild(div);
    });
    chatSection.classList.remove("hidden");
    alertsSection.classList.add("hidden");
    chatWindow.scrollTop = chatWindow.scrollHeight;
    renderSessionsList();
  } catch (err) {
    console.error('Error loading session:', err);
  }
}

// ================= SIDEBAR =================
title.onclick = () => {
  sidebar.classList.toggle("show");
  overlay.classList.toggle("show");
};

overlay.onclick = closeSidebar;

function closeSidebar() {
  sidebar.classList.remove("show");
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
  createNewSession();
  closeSidebar();
};

// ✅ INTEGRATED (4) — SA consumption on alerts
document.getElementById("show-alerts").onclick = () => {
  const token = localStorage.getItem("qlasar_token");
  if (!token) {
    alert("Please login to use Scouted Alerts.");
    return;
  }
  if (!consumeSA(1)) {
    alert("⚠️ You have 0 SA left. Please buy more alerts to continue.");
    return;
  }
  chatSection.classList.add("hidden");
  alertsSection.classList.remove("hidden");
  closeSidebar();
  loadAlerts();
};

document.getElementById("show-sessions").onclick = async () => {
  sessionsPanel.classList.toggle("show");
  await renderSessionsList();
  closeSidebar();
};

// ================= AUTH UI =================
const authModal = document.getElementById("auth-modal");
const authTitle = document.getElementById("auth-title");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authToggle = document.getElementById("auth-toggle");
const authClose = document.getElementById("auth-close");
const authStatus = document.getElementById("auth-status");

const accountInfo = document.getElementById("account-info");
const accountEmail = document.getElementById("account-email");
const authForm = document.getElementById("auth-form");
const logoutBtn = document.getElementById("logout-btn");

let authMode = "signup";

document.getElementById("account-btn").onclick = () => {
  const token = localStorage.getItem("qlasar_token");
  const email = localStorage.getItem("qlasar_email");
  authModal.classList.remove("auth-hidden");
  sessionsPanel.classList.remove("show");
  closeSidebar();

  if (token && email) {
    accountInfo.classList.remove("hidden");
    authForm.classList.add("hidden");
    accountEmail.innerText = email;
  } else {
    accountInfo.classList.add("hidden");
    authForm.classList.remove("hidden");
  }
};

authClose.onclick = () => authModal.classList.add("auth-hidden");

authToggle.onclick = () => {
  authMode = authMode === "signup" ? "login" : "signup";
  authTitle.innerText = authMode === "signup" ? "Create account" : "Login";
  authSubmit.innerText = authTitle.innerText;
  authStatus.innerText = "";
};

authSubmit.onclick = async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();

  if (!email || !password) {
    return (authStatus.innerText = "Enter email and password.");
  }

  authStatus.innerText = "Processing...";

  try {
    const endpoint =
      authMode === "signup"
        ? "/api/auth/signup"
        : "/api/auth/login";

    const res = await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: { "Content-Type": "application/json" }
    });
    const data = res;

    if (!res || res.error) {
      return (authStatus.innerText = res.error || "Authentication failed.");
    }

    // ✅ INTEGRATED (login credits visibility)
    if (data.access_token) {
      localStorage.setItem("qlasar_token", data.access_token);
      localStorage.setItem("qlasar_email", email);
      authStatus.innerText = "✔️ Logged in.";
      updateCreditsVisibility();
      setTimeout(() => {
        authModal.classList.add("auth-hidden");
        renderSessionsListHybrid();
      }, 800);
    }
  } catch {
    authStatus.innerText = "🌐 Network error.";
  }
};

// ✅ INTEGRATED (logout credits visibility)
logoutBtn.onclick = () => {
  localStorage.removeItem("qlasar_token");
  localStorage.removeItem("qlasar_email");
  currentSessionId = null;
  currentSessionSource = "local";

  accountInfo.classList.add("hidden");
  authForm.classList.remove("hidden");

  authMode = "signup";
  authTitle.innerText = "Create Account";
  authSubmit.innerText = "Continue";
  authToggle.innerHTML = 'Already have an account? <span>Login</span>';
  authStatus.innerText = "";

  authModal.classList.add("auth-hidden");

  chatWindow.innerHTML = "";
  welcome();
  renderSessionsListHybrid();
  updateCreditsVisibility();
};

// ================= SESSIONS LIST (CLOUD ONLY) =================
async function renderSessionsList() {
  sessionsPanelList.innerHTML = "Loading...";

  const token = localStorage.getItem("qlasar_token");
  if (!token) {
    sessionsPanelList.innerHTML = "Login to view saved sessions.";
    return;
  }

  try {
    const sessions = await apiRequest("/api/sessions", { method: "GET" });
    sessionsPanelList.innerHTML = "";

    (sessions || []).forEach(s => {
      const row = document.createElement("div");
      row.className = "session-pill session-row";

      const title = document.createElement("span");
      title.textContent = "💬 " + (s.title || "Untitled chat");
      title.style.flex = "1";
      title.style.cursor = "pointer";

      title.onclick = () => loadSession(s.id);

      const actions = document.createElement("div");
      actions.className = "session-actions";

      const renameBtn = document.createElement("button");
      renameBtn.className = "session-action-btn";
      renameBtn.textContent = "✏️";
      renameBtn.onclick = e => {
        e.stopPropagation();
        renameSession(s.id, s.title);
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "session-action-btn";
      deleteBtn.textContent = "🗑️";
      deleteBtn.onclick = e => {
        e.stopPropagation();
        deleteSession(s.id);
      };

      actions.appendChild(renameBtn);
      actions.appendChild(deleteBtn);

      row.appendChild(title);
      row.appendChild(actions);

      if (s.id === currentSessionId) {
        row.classList.add("active-session");
      }

      sessionsPanelList.appendChild(row);
    });
  } catch (err) {
    console.error('Error rendering sessions list:', err);
    sessionsPanelList.innerHTML = "Error loading sessions.";
  }
}

async function renameSession(sessionId, oldTitle = "") {
  const token = localStorage.getItem("qlasar_token");
  if (!token) return;

  const newTitle = prompt("Rename session:", oldTitle || "");
  if (!newTitle || newTitle.trim() === oldTitle) return;

  try {
    const res = await apiRequest(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({ title: newTitle.trim() }),
      headers: { "Content-Type": "application/json" }
    });
    if (!res || res.error) {
      alert("Failed to rename session.");
      return;
    }
    renderSessionsList();
  } catch {
    alert("Network error while renaming session.");
  }
}

async function deleteSession(sessionId) {
  const token = localStorage.getItem("qlasar_token");
  if (!token) return;

  const confirmDelete = confirm("Delete this session permanently?");
  if (!confirmDelete) return;

  try {
    const res = await apiRequest(`/api/sessions/${sessionId}`, {
      method: "DELETE"
    });
    if (!res || res.error) {
      alert("Failed to delete session.");
      return;
    }
    if (sessionId === currentSessionId) {
      currentSessionId = null;
      chatWindow.innerHTML = "";
      welcome();
    }
    renderSessionsList();
  } catch {
    alert("Network error while deleting session.");
  }
}

// ================= ALERTS =================
async function loadAlerts() {
  alertsList.innerHTML = "Loading...";
  try {
    const data = await apiRequest("/api/alerts");
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
    if (!(data.alerts && data.alerts.length)) {
      alertsList.innerHTML = "No alerts available.";
    }
  } catch {
    alertsList.innerHTML = "⚠️ Network error loading alerts.";
  }
}

// ================= CHAT SEND (CLOUD ONLY) =================
function bindSendEvents() {
  if (!sendBtn || !input) {
    console.log("Send elements not ready yet");
    return;
  }

  console.log("Binding send events...");

  async function send() {
    console.log("SEND FUNCTION TRIGGERED");
    const text = input.value.trim();
    if (!text) return;

    const token = localStorage.getItem("qlasar_token");
    if (!token) {
      alert("Please login to send messages.");
      return;
    }

    // ✅ INTEGRATED (3) — consume QC BEFORE sending
    if (!consumeQC(1)) {
      alert("⚠️ You have 0 QC left. Please buy more credits to continue.");
      return;
    }

    if (!currentSessionId) {
      await createNewSession();
      if (!currentSessionId) return;
    }

    const u = document.createElement("div");
    u.className = "message user";
    u.innerText = text;
    chatWindow.appendChild(u);
    input.value = "";

    const a = document.createElement("div");
    a.className = "message ai";
    a.innerText = "Thinking…";
    chatWindow.appendChild(a);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    let reply = "🌐 Network error.";
    try {
      const res = await fetch(`${API_BASE}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ sender: "user", text }] })
      });
      const data = await res.json();
      reply = (data?.reply || "")
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .trim() || reply;
      a.innerText = reply;
    } catch {
      a.innerText = reply;
    }

    // Save messages to session
    await apiRequest(`/api/sessions/${currentSessionId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sender: "user", text })
    });
    await apiRequest(`/api/sessions/${currentSessionId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ sender: "ai", text: reply })
    });

    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  sendBtn.onclick = send;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });

  console.log("Send events bound successfully");
}

// ===================== Initialization =====================
document.addEventListener("DOMContentLoaded", () => {
  bindSendEvents();
  updateCreditsVisibility();
  renderCredits(); // Ensures credits are shown on load
});
