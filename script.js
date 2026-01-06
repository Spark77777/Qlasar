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


// ================= AUTH UI =================
const authModal = document.getElementById("auth-modal");
const authTitle = document.getElementById("auth-title");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authToggle = document.getElementById("auth-toggle");
const authClose = document.getElementById("auth-close");
const authStatus = document.getElementById("auth-status");

// 🚀 DEFAULT MODE = SIGNUP (Create Account)
let authMode = "signup";

authTitle.innerText = "Create account";
authSubmit.innerText = "Create account";
authToggle.innerHTML = `Already have an account? <span>Login</span>`;

// open auth
document.getElementById("account-btn").onclick = () => {
  authModal.classList.remove("auth-hidden");
  closeSidebar();
};

// close auth
authClose.onclick = () => authModal.classList.add("auth-hidden");


// toggle login/signup
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

    // ------------- ERROR HANDLING -------------
    if (!res.ok) {

      const msg = (data.error || "").toLowerCase();

      if (
        msg.includes("already") ||
        msg.includes("exists") ||
        msg.includes("duplicate")
      ) {
        authStatus.innerText =
          "⚠️ An account with this email already exists. Please login instead.";
        return;
      }

      authStatus.innerText = data.error || "Authentication failed.";
      return;
    }

    // ------------- SIGNUP SUCCESS -------------
    if (authMode === "signup") {
      authStatus.innerText = "🎉 Account created successfully. Please login now.";
      authMode = "login";
      authTitle.innerText = "Login";
      authSubmit.innerText = "Login";
      authToggle.innerHTML = `No account? <span>Create one</span>`;
      return;
    }

    // ------------- LOGIN SUCCESS -------------
    if (data.access_token) {
      localStorage.setItem("qlasar_token", data.access_token);
      authStatus.innerText = "✔️ Logged in successfully.";

      setTimeout(() => {
        authModal.classList.add("auth-hidden");
      }, 900);
    }

  } catch (err) {
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
    a.innerText = reply || "⚠️ No reply received.";
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
