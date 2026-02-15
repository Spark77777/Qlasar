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

// ✅ INTEGRATED (1) — Credits DOM + logic
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

// ================= SESSIONS / ALERTS / CHAT CODE REMAINS SAME =================


// ================= TOPIC ALERT SYSTEM =================

const topicInput = document.getElementById("alert-topic-input");
const addTopicBtn = document.getElementById("add-alert-topic");
const topicsListEl = document.getElementById("alert-topics-list");

function getTopics() {
  return JSON.parse(localStorage.getItem("qlasar_alert_topics") || "[]");
}

function saveTopics(topics) {
  localStorage.setItem("qlasar_alert_topics", JSON.stringify(topics));
  renderTopics();
}

function renderTopics() {
  const topics = getTopics();
  topicsListEl.innerHTML = "";

  topics.forEach(t => {
    const row = document.createElement("div");
    row.className = "alert-topic-row";

    row.innerHTML = `
      <span class="alert-topic-label">${t.label}</span>
      <div class="alert-topic-actions">
        <button data-id="${t.id}" class="toggle-topic">
          ${t.enabled ? "ON" : "OFF"}
        </button>
        <button data-id="${t.id}" class="delete-topic">✖</button>
      </div>
    `;

    topicsListEl.appendChild(row);
  });

  bindTopicButtons();
}

function bindTopicButtons() {
  document.querySelectorAll(".toggle-topic").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const topics = getTopics();

      const updated = topics.map(t =>
        t.id === id ? { ...t, enabled: !t.enabled } : t
      );

      saveTopics(updated);
    };
  });

  document.querySelectorAll(".delete-topic").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const topics = getTopics().filter(t => t.id !== id);
      saveTopics(topics);
    };
  });
}

addTopicBtn.onclick = () => {
  const label = topicInput.value.trim();
  if (!label) return;

  const topics = getTopics();

  if (topics.some(t => t.label.toLowerCase() === label.toLowerCase())) {
    alert("Topic already exists.");
    return;
  }

  if (topics.length >= 10) {
    alert("Topic limit reached.");
    return;
  }

  const newTopic = {
    id: Date.now(),
    label,
    enabled: true
  };

  topicInput.value = "";
  saveTopics([...topics, newTopic]);
};

document.addEventListener("DOMContentLoaded", renderTopics);


// ================= PAGE LOAD =================
document.addEventListener("DOMContentLoaded", () => {
  bindSendEvents();
  updateCreditsVisibility();
  renderCredits();
});
