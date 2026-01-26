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

console.log("SEND BUTTON ELEMENT:", sendBtn);
console.log("INPUT ELEMENT:", input);

// ⭐ sessions panel
const sessionsPanel = document.getElementById("sessions-panel");
const sessionsPanelList = document.getElementById("sessions-panel-list");

// ====================== SESSION STATE ======================
let currentSessionId = null;

// ================= CREATE NEW SESSION (CLOUD ONLY) =================
async function createNewSession() {
  const token = localStorage.getItem("qlasar_token");

  if (!token) {
    alert("Please login to start using Qlasar.");
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

    welcome();
    renderSessionsList();

  } catch {
    alert("Failed to create session. Please try again.");
  }
}

// ================= LOAD SESSION (CLOUD) =================
async function loadSession(id) {
  const token = localStorage.getItem("qlasar_token");
  if (!token) return;

  currentSessionId = id;

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
  renderSessionsList();
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

document.getElementById("show-alerts").onclick = () => {
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
    return authStatus.innerText = "Enter email and password.";
  }

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

    if (!res.ok) {
      return authStatus.innerText = data.error || "Authentication failed.";
    }

    // ✅ INTEGRATED (1)
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

// ✅ INTEGRATED (2)
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
  authToggle.innerHTML = `Already have an account? <span>Login</span>`;
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
    const res = await fetch(`${API_BASE}/api/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const sessions = await res.json();

    sessionsPanelList.innerHTML = "";

    sessions.forEach(s => {
      const pill = document.createElement("div");
      pill.className = "session-pill";
      pill.textContent = "💬 " + (s.title || "Untitled chat");

      if (s.id === currentSessionId) {
        pill.classList.add("active-session");
      }

      pill.onclick = () => loadSession(s.id);
      sessionsPanelList.appendChild(pill);
    });

  } catch {
    sessionsPanelList.innerHTML = "Error loading sessions.";
  }
}

// ✅ SUPPORT FUNCTION (needed because your integration calls it)
function renderSessionsListHybrid() {
  // In cloud-only mode, hybrid is the same as renderSessionsList()
  return renderSessionsList();
}

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

    if (!data.alerts?.length) {
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

document.addEventListener("DOMContentLoaded", () => {
  bindSendEvents();

  // ✅ NEW — set correct credits visibility on first load
  updateCreditsVisibility();
});
