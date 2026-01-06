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

// ================= SESSION STORAGE =================

let currentSessionId = null;

function loadSessions() {
  return JSON.parse(localStorage.getItem("qlasar_sessions") || "{}");
}

function saveSessions(data) {
  localStorage.setItem("qlasar_sessions", JSON.stringify(data));
}

function createSession() {
  const id = crypto.randomUUID();
  const sessions = loadSessions();

  sessions[id] = {
    title: "New chat",
    messages: []
  };

  saveSessions(sessions);
  currentSessionId = id;
}

function saveMessage(sender, text) {
  const sessions = loadSessions();
  sessions[currentSessionId].messages.push({ sender, text });
  saveSessions(sessions);
}

function loadSessionToUI(id) {
  currentSessionId = id;

  const sessions = loadSessions();
  const data = sessions[id];

  chatWindow.innerHTML = "";

  data.messages.forEach(m => {
    const div = document.createElement("div");
    div.className = `message ${m.sender === "user" ? "user" : "ai"}`;
    div.innerText = m.text;
    chatWindow.appendChild(div);
  });

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

createSession();
welcome();

// ================= MENU =================

document.getElementById("new-chat").onclick = () => {
  createSession();
  welcome();
  closeSidebar();
};

document.getElementById("show-alerts").onclick = () => {
  chatSection.classList.add("hidden");
  alertsSection.classList.remove("hidden");
  closeSidebar();
  loadAlerts();
};

// ========= SHOW SAVED SESSIONS (simple popup for now) =========

document.getElementById("show-sessions").onclick = () => {
  const sessions = loadSessions();
  const keys = Object.keys(sessions);

  if (keys.length === 0) {
    alert("No saved chats yet.");
    return;
  }

  const choice = prompt(
    "Enter session number to open:\n\n" +
      keys
        .map((id, i) => `${i + 1}) ${sessions[id].title}`)
        .join("\n")
  );

  const index = parseInt(choice) - 1;
  if (index >= 0 && index < keys.length) {
    loadSessionToUI(keys[index]);
  }
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
      if ((data.error || "").toLowerCase().includes("exists")) {
        authStatus.innerText =
          "⚠️ Account already exists. Please login instead.";
        return;
      }

      authStatus.innerText = data.error || "Authentication failed.";
      return;
    }

    if (authMode === "signup") {
      authStatus.innerText = "🎉 Account created. Please log in now.";
      authMode = "login";
      return;
    }

    if (data.access_token) {
      localStorage.setItem("qlasar_token", data.access_token);
      authStatus.innerText = "✔️ Logged in.";

      setTimeout(() => {
        authModal.classList.add("auth-hidden");
      }, 900);
    }
  } catch {
    authStatus.innerText = "Network error.";
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

  saveMessage("user", text);

  const u = document.createElement("div");
  u.className = "message user";
  u.innerText = text;
  chatWindow.appendChild(u);

  input.value = "";

  const a = document.createElement("div");
  a.className = "message ai";
  a.innerText = "Thinking…";
  chatWindow.appendChild(a);

  try {
    const res = await fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ sender: "user", text }]
      })
    });

    const data = await res.json();
    let reply = data?.reply || "No reply.";

    reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    a.innerText = reply;
    saveMessage("ai", reply);

  } catch {
    a.innerText = "Network error.";
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
  } catch {
    alertsList.innerHTML = "Error loading alerts.";
  }
}
