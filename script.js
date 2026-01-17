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

// ⭐ sessions panel (single source of truth)
const sessionsPanel = document.getElementById("sessions-panel");
const sessionsPanelList = document.getElementById("sessions-panel-list");

// ====================== SESSION STATE ======================
let currentSessionId = null;
let currentSessionSource = "local"; // "local" | "cloud"

// ====================== LOCAL STORAGE ======================
function getAllSessions() {
  return JSON.parse(localStorage.getItem("qlasar_sessions") || "{}");
}

function saveAllSessions(sessions) {
  localStorage.setItem("qlasar_sessions", JSON.stringify(sessions));
}

// ================= CREATE NEW SESSION (HYBRID) =================
async function createNewSession() {
  const token = localStorage.getItem("qlasar_token");

  if (!token) {
    const id = Date.now().toString();
    const sessions = getAllSessions();
    sessions[id] = { title: "New chat", messages: [] };
    saveAllSessions(sessions);

    currentSessionId = id;
    currentSessionSource = "local";

    welcome();
    renderSessionsListHybrid();
    return;
  }

  try {
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
    currentSessionSource = "cloud";

    welcome();

  } catch {
    const id = Date.now().toString();
    const sessions = getAllSessions();
    sessions[id] = { title: "New chat", messages: [] };
    saveAllSessions(sessions);

    currentSessionId = id;
    currentSessionSource = "local";

    welcome();
  }

  renderSessionsListHybrid();
}

// ================= LOAD SESSION (LOCAL) =================
function loadSession(id) {
  currentSessionId = id;
  currentSessionSource = "local";

  const session = getAllSessions()[id];

  chatSection.classList.remove("hidden");
  alertsSection.classList.add("hidden");
  chatWindow.innerHTML = "";
  sessionsPanel.classList.remove("show");

  if (!session || !session.messages.length) {
    welcome();
  } else {
    session.messages.forEach(m => {
      const div = document.createElement("div");
      div.className = `message ${m.sender}`;
      div.innerText = m.text;
      chatWindow.appendChild(div);
    });
  }

  chatWindow.scrollTop = chatWindow.scrollHeight;
  renderSessionsListHybrid();
}

// ================= LOAD SESSION (CLOUD) =================
async function loadSessionFromServer(id) {
  const token = localStorage.getItem("qlasar_token");
  if (!token) return;

  currentSessionId = id;
  currentSessionSource = "cloud";

  const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

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
  renderSessionsListHybrid();
}

// ================= SIDEBAR =================
title.onclick = () => {
  sidebar.style.left = "0";
  overlay.classList.add("show");
};

overlay.onclick = closeSidebar;

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
  createNewSession();
  closeSidebar();
};

document.getElementById("show-alerts").onclick = () => {
  chatSection.classList.add("hidden");
  alertsSection.classList.remove("hidden");
  closeSidebar();
  loadAlerts();
};

document.getElementById("show-sessions").onclick = async () => {
  sessionsPanel.classList.toggle("show");
  await renderSessionsListHybrid();
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

// 🔹 NEWLY INTEGRATED ACCOUNT UI ELEMENTS
const accountInfo = document.getElementById("account-info");
const accountEmail = document.getElementById("account-email");
const authForm = document.getElementById("auth-form");
const logoutBtn = document.getElementById("logout-btn");

let authMode = "signup";

// 🔹 UPDATED ACCOUNT BUTTON LOGIC
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
  if (!email || !password) return authStatus.innerText = "Enter email and password.";

  authStatus.innerText = "Processing...";

  try {
    const endpoint =
      authMode === "signup"
        ? `${API_BASE}/api/auth/signup`
        : `${API_BASE}/api/auth/login`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) return authStatus.innerText = data.error || "Authentication failed.";

    if (data.access_token) {
      // 🔹 STORE TOKEN + EMAIL
      localStorage.setItem("qlasar_token", data.access_token);
      localStorage.setItem("qlasar_email", email);

      authStatus.innerText = "✔️ Logged in.";

      setTimeout(() => {
        authModal.classList.add("auth-hidden");
        renderSessionsListHybrid();
      }, 800);
    }

  } catch {
    authStatus.innerText = "🌐 Network error.";
  }
};

// 🔹 LOGOUT FUNCTIONALITY
logoutBtn.onclick = () => {
  localStorage.removeItem("qlasar_token");
  localStorage.removeItem("qlasar_email");

  currentSessionId = null;
  currentSessionSource = "local";

  accountInfo.classList.add("hidden");
  authForm.classList.remove("hidden");

  authModal.classList.add("auth-hidden");

  chatWindow.innerHTML = "";
  welcome();
  renderSessionsListHybrid();
};

// ================= ALERTS =================
async function loadAlerts() {
  alertsList.innerHTML = "Loading...";

  try {
    const res = await fetch(`${API_BASE}/api/alerts`);
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

    if (!data.alerts?.length) alertsList.innerHTML = "No alerts available.";
  } catch {
    alertsList.innerHTML = "⚠️ Network error loading alerts.";
  }
}
