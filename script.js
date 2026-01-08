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

// ⭐ sessions panel elements
const sessionsPanel = document.getElementById("sessions-panel");
const sessionsPanelList = document.getElementById("sessions-panel-list");

// ====================== SESSIONS (LOCAL) ======================
let currentSessionId = null;

function getAllSessions() {
  return JSON.parse(localStorage.getItem("qlasar_sessions") || "{}");
}

function saveAllSessions(sessions) {
  localStorage.setItem("qlasar_sessions", JSON.stringify(sessions));
}



// ================= CREATE NEW SESSION (HYBRID) =================
async function createNewSession() {

  const token = localStorage.getItem("qlasar_token");

  // -------- NOT LOGGED IN → local storage --------
  if (!token) {
    const id = Date.now().toString();

    const sessions = getAllSessions();
    sessions[id] = { title: "New chat", messages: [] };

    saveAllSessions(sessions);
    currentSessionId = id;

    welcome();
    renderSessionsList();
    return;
  }

  // -------- LOGGED IN → backend storage --------
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

  } catch (err) {
    console.error("Cloud session failed, fallback to local:", err);

    const id = Date.now().toString();
    const sessions = getAllSessions();
    sessions[id] = { title: "New chat", messages: [] };
    saveAllSessions(sessions);
    currentSessionId = id;
    welcome();
  }

  renderSessionsList();
}



// ================= LOAD SESSION FROM LOCAL =================
function loadSession(id) {
  currentSessionId = id;

  const sessions = getAllSessions();
  const session = sessions[id];

  chatSection.classList.remove("hidden");
  alertsSection.classList.add("hidden");

  chatWindow.innerHTML = "";

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
}



// ================= LOAD SESSION FROM SERVER =================
async function loadSessionFromServer(id) {

  const token = localStorage.getItem("qlasar_token");
  if (!token) return;

  const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  currentSessionId = id;

  chatWindow.innerHTML = "";

  (data.messages || []).forEach(m => {
    const div = document.createElement("div");
    div.className = `message ${m.sender}`;
    div.innerText = m.text;
    chatWindow.appendChild(div);
  });

  chatSection.classList.remove("hidden");
  alertsSection.classList.add("hidden");

  chatWindow.scrollTop = chatWindow.scrollHeight;
}



// ================= SIDEBAR =================
title.onclick = () => {
  sidebar.style.left = "0";
  overlay.classList.add("show");
};

overlay.onclick = () => closeSidebar();

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


// ⭐ REPLACED: now shows cloud or local sessions list
document.getElementById("show-sessions").onclick = () => {
  showSessionsList();
  closeSidebar();
};



// ================= SHOW SESSIONS LIST (HYBRID) =================
async function showSessionsList() {

  const token = localStorage.getItem("qlasar_token");

  alertsSection.classList.remove("hidden");
  chatSection.classList.add("hidden");

  alertsList.innerHTML = "Loading sessions...";

  // LOGGED IN → fetch from Supabase
  if (token) {
    const res = await fetch(`${API_BASE}/api/sessions`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const sessions = await res.json();

    alertsList.innerHTML = "<h3>Saved sessions</h3>";

    sessions.forEach(s => {
      const btn = document.createElement("div");
      btn.className = "alert-card";
      btn.innerText = s.title || "Untitled chat";

      btn.onclick = () => loadSessionFromServer(s.id);

      alertsList.appendChild(btn);
    });

    return;
  }

  // NOT LOGGED IN → local sessions
  const sessions = getAllSessions();

  alertsList.innerHTML = "<h3>Saved sessions</h3>";

  Object.entries(sessions).forEach(([id, s]) => {
    const btn = document.createElement("div");
    btn.className = "alert-card";
    btn.innerText = s.title || "Untitled chat";

    btn.onclick = () => loadSession(id);

    alertsList.appendChild(btn);
  });
}



// ================= AUTH UI =================
const authModal = document.getElementById("auth-modal");
const authTitle = document.getElementById("auth-title");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authToggle = document.getElementById("auth-toggle");
const authClose = document.getElementById("auth-close");
const authStatus = document.getElementById("auth-status");

let authMode = "signup";

authTitle.innerText = "Create account";
authSubmit.innerText = "Create account";
authToggle.innerHTML = `Already have an account? <span>Login</span>`;

document.getElementById("account-btn").onclick = () => {
  authModal.classList.remove("auth-hidden");
  closeSidebar();
};

authClose.onclick = () => authModal.classList.add("auth-hidden");

authToggle.onclick = () => {
  if (authMode === "signup") {
    authMode = "login";
    authTitle.innerText = "Login";
    authSubmit.innerText = "Login";
    authToggle.innerHTML = `No account? <span>Create one</span>`;
  } else {
    authMode = "signup";
    authTitle.innerText = "Create account";
    authSubmit.innerText = "Create account";
    authToggle.innerHTML = `Already have an account? <span>Login</span>`;
  }

  authStatus.innerText = "";
};



// ================= AUTH SUBMIT =================
authSubmit.onclick = async () => {

  const email = authEmail.value.trim();
  const password = authPassword.value.trim();

  if (!email || !password) {
    authStatus.innerText = "Enter email and password.";
    return;
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
      authStatus.innerText = data.error || "Authentication failed.";
      return;
    }

    if (authMode === "signup") {
      authStatus.innerText = "🎉 Account created. Please login.";
      authMode = "login";
      return;
    }

    if (data.access_token) {
      localStorage.setItem("qlasar_token", data.access_token);
      authStatus.innerText = "✔️ Logged in.";
      setTimeout(() => authModal.classList.add("auth-hidden"), 900);
    }

  } catch {
    authStatus.innerText = "🌐 Network error. Try again.";
  }
};



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

  if (!currentSessionId) await createNewSession();

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

  let reply = "";

  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ sender: "user", text }]
      })
    });

    const data = await res.json();

    reply = data?.reply || "";
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    if (!reply) reply = "⚠️ No reply received.";

    a.innerText = reply;

  } catch {
    reply = "🌐 Network error.";
    a.innerText = reply;
  }

  // ================== SAVE MESSAGES (HYBRID) ==================
  const token = localStorage.getItem("qlasar_token");

  // -------- LOGGED IN → save to Supabase --------
  if (token && currentSessionId) {

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

  }

  // -------- NOT LOGGED IN → fallback local --------
  else {
    let sessions = getAllSessions();
    sessions[currentSessionId].messages.push({ sender: "user", text });
    sessions[currentSessionId].messages.push({ sender: "ai", text: reply });
    saveAllSessions(sessions);
  }

  chatWindow.scrollTop = chatWindow.scrollHeight;
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

    if (!data.alerts || data.alerts.length === 0)
      alertsList.innerHTML = "No alerts available.";

  } catch {
    alertsList.innerHTML = "⚠️ Network error loading alerts.";
  }
}
