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

// ⭐ NEW — sessions panel elements
const sessionsPanel = document.getElementById("sessions-panel");
const sessionsPanelList = document.getElementById("sessions-panel-list");

// ================= SESSIONS (LOCAL STORAGE) =================
let currentSessionId = null;

function getAllSessions() {
  return JSON.parse(localStorage.getItem("qlasar_sessions") || "{}");
}

function saveAllSessions(sessions) {
  localStorage.setItem("qlasar_sessions", JSON.stringify(sessions));
}

// ✅ INTEGRATED — with highlight refresh
function createNewSession() {
  const id = Date.now().toString();

  const sessions = getAllSessions();
  sessions[id] = {
    title: "New chat",
    messages: []
  };

  saveAllSessions(sessions);
  currentSessionId = id;

  welcome();

  // 🔹 update highlight
  renderSessionsList();
}


// ================= LOAD A SESSION =================
// ✅ INTEGRATED — with highlight refresh and panel close
function loadSession(id) {
  currentSessionId = id;

  const sessions = getAllSessions();
  const session = sessions[id];

  chatSection.classList.remove("hidden");
  alertsSection.classList.add("hidden");

  chatWindow.innerHTML = "";

  // close session panel when opened
  sessionsPanel.classList.remove("show");

  if (!session || !session.messages.length) {
    welcome();
  } else {
    session.messages.forEach(msg => {
      const div = document.createElement("div");
      div.className = `message ${msg.sender}`;
      div.innerText = msg.text;
      chatWindow.appendChild(div);
    });
  }

  chatWindow.scrollTop = chatWindow.scrollHeight;

  // 🔹 refresh highlight
  renderSessionsList();
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


// ================= SAVED SESSIONS PANEL =================

// open / close panel button
document.getElementById("show-sessions").onclick = () => {
  sessionsPanel.classList.toggle("show");
  renderSessionsList();
  closeSidebar();
};

// build list in right panel
function renderSessionsList() {

  const sessions = getAllSessions();
  sessionsPanelList.innerHTML = "";

  if (Object.keys(sessions).length === 0) {
    sessionsPanelList.innerHTML = "<small>No saved chats yet.</small>";
    return;
  }

  Object.entries(sessions).forEach(([id, session]) => {

    const row = document.createElement("div");
    row.className = "session-row";

    // clickable title pill WITH ACTIVE HIGHLIGHT
    const pill = document.createElement("div");
    pill.className = "session-pill";
    pill.textContent = "💬 " + (session.title || "Untitled chat");

    // 🔹 highlight currently active session
    if (id === currentSessionId) {
      pill.classList.add("active-session");
    }

    pill.onclick = () => loadSession(id);

    // rename + delete button container
    const actions = document.createElement("div");
    actions.className = "session-actions";

    // ✍ rename button
    const renameBtn = document.createElement("button");
    renameBtn.className = "session-action-btn";
    renameBtn.textContent = "✎";
    renameBtn.title = "Rename session";
    renameBtn.onclick = () => renameSession(id);

    // 🗑 delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "session-action-btn";
    deleteBtn.textContent = "🗑";
    deleteBtn.title = "Delete session";
    deleteBtn.onclick = () => deleteSession(id);

    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(pill);
    row.appendChild(actions);

    sessionsPanelList.appendChild(row);
  });
}


// ================= RENAME SESSION =================
function renameSession(id) {
  const sessions = getAllSessions();

  const current = sessions[id];
  if (!current) return;

  const newTitle = prompt("Rename chat:", current.title || "Untitled chat");

  if (!newTitle) return;

  current.title = newTitle;
  saveAllSessions(sessions);

  renderSessionsList();
}


// ================= DELETE SESSION =================
function deleteSession(id) {

  if (!confirm("Delete this chat permanently?")) return;

  const sessions = getAllSessions();

  delete sessions[id];
  saveAllSessions(sessions);

  // reset if we deleted open session
  if (currentSessionId === id) {
    currentSessionId = null;
    chatWindow.innerHTML = "";
    welcome();
  }

  renderSessionsList();
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
      const msg = (data.error || "").toLowerCase();

      if (msg.includes("already") || msg.includes("exists") || msg.includes("duplicate")) {
        authStatus.innerText = "⚠️ Account already exists — please login.";
        return;
      }

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

  if (!currentSessionId) createNewSession();

  let sessions = getAllSessions();
  sessions[currentSessionId].messages.push({ sender: "user", text });
  saveAllSessions(sessions);

  chatSection.classList.remove("hidden");
  alertsSection.classList.add("hidden");

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

  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ sender: "user", text }]
      })
    });

    const data = await res.json();

    let reply = data?.reply || "";
    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    if (!reply) reply = "⚠️ No reply received.";

    a.innerText = reply;

    let s2 = getAllSessions();
    s2[currentSessionId].messages.push({ sender: "ai", text: reply });
    saveAllSessions(s2);

  } catch {
    a.innerText = "🌐 Network error.";
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
