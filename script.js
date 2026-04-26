const API_BASE = "https://qlasar-qx6y.onrender.com";

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const title = document.getElementById("qlasar-title");

const chatSection = document.getElementById("chat-section");
const alertsSection = document.getElementById("alerts-section");

const chatWindow = document.getElementById("chat-window");
const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("message-input");

let alertsList;

document.addEventListener("DOMContentLoaded", () => {
  alertsList = document.getElementById("alerts-list");
});

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
    qc: parseInt(localStorage.getItem("qc") || "10"),
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
    await renderSessionsList(); // ensure list updates after creating
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
    const data = await apiRequest(`/api/sessions/${id}`);
    chatWindow.innerHTML = "";
    // Assuming sessionsPanel exists for toggling
    if (typeof sessionsPanel !== 'undefined') {
      sessionsPanel.classList.remove("show");
    }
    (data.messages || []).forEach(m => {
      const div = document.createElement("div");
      div.className = `message ${m.sender}`;
      div.innerText = m.text;
      chatWindow.appendChild(div);
    });
    chatSection.classList.remove("hidden");
    alertsSection.classList.add("hidden");
    chatWindow.scrollTop = chatWindow.scrollHeight;
    await renderSessionsList(); // update list to mark active
  } catch (err) {
    console.error('Error loading session:', err);
  }
}

// ================= SIDEBAR =================
title.onclick = () => {
  document.getElementById("sidebar").classList.toggle("show");
  document.getElementById("overlay").classList.toggle("show");
};

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("show");
  document.getElementById("overlay").classList.remove("show");
}

document.getElementById("overlay").onclick = closeSidebar;

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
  // Assuming sessionsPanel exists
  if (typeof sessionsPanel !== 'undefined') {
    sessionsPanel.classList.toggle("show");
  }
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
  if (typeof sessionsPanel !== 'undefined') {
    sessionsPanel.classList.remove("show");
  }
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
    const endpoint = authMode === "signup" ? "/api/auth/signup" : "/api/auth/login";

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
        renderSessionsList(); // refresh list after login
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
  // reset other session states if needed
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
  if (typeof renderSessionsListHybrid === 'function') {
    renderSessionsListHybrid();
  }
  updateCreditsVisibility();
};

// ================= SESSIONS LIST (CLOUD ONLY) =================
async function renderSessionsList() {
  const sessionsPanelList = document.getElementById("sessions-panel-list");
  sessionsPanelList.innerHTML = "Loading...";

  const token = localStorage.getItem("qlasar_token");
  if (!token) {
    sessionsPanelList.innerHTML = "Login to view saved sessions.";
    return;
  }

  try {
    const sessionsResponse = await apiRequest("/api/sessions");
    console.log('API response from /api/sessions:', sessionsResponse);

    // Check if response is an array
    if (!Array.isArray(sessionsResponse)) {
      console.error('Unexpected response shape:', sessionsResponse);
      sessionsPanelList.innerHTML = "Error: Unexpected response shape.";
      return;
    }

    // Clear existing list
    sessionsPanelList.innerHTML = "";

    (sessionsResponse || []).forEach(s => {
      const row = document.createElement("div");
      row.className = "session-pill session-row";

      const title = document.createElement("span");
      title.textContent = "💬 " + (s.title || "Untitled chat");
      title.style.flex = "1";
      title.style.cursor = "pointer";

      // Load session on click
      title.onclick = () => {
        console.log("Loading session ID:", s.id);
        loadSession(s.id);
      };

      const actions = document.createElement("div");
      actions.className = "session-actions";

      const renameBtn = document.createElement("button");
      renameBtn.className = "session-action-btn";
      renameBtn.innerText = "✏️";
      renameBtn.onclick = e => {
        e.stopPropagation();
        renameSession(s.id, s.title);
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "session-action-btn";
      deleteBtn.innerText = "🗑️";
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

    console.log("Rendered sessions list");
  } catch (err) {
    console.error('Error rendering sessions list:', err);
    document.getElementById("sessions-panel-list").innerHTML = "Error loading sessions.";
  }
}

async function renameSession(sessionId, oldTitle = "") {
  const newTitle = prompt("Rename session:", oldTitle || "");
  if (!newTitle || newTitle.trim() === oldTitle) return;

  try {
    await apiRequest(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({ title: newTitle.trim() }),
      headers: { "Content-Type": "application/json" }
    });
    await renderSessionsList(); // refresh list after renaming
  } catch {
    alert("Network error while renaming session.");
  }
}

async function deleteSession(sessionId) {
  const confirmDelete = confirm("Delete this session permanently?");
  if (!confirmDelete) return;

  try {
    await apiRequest(`/api/sessions/${sessionId}`, { method: "DELETE" });
    if (sessionId === currentSessionId) {
      currentSessionId = null;
      chatWindow.innerHTML = "";
      welcome();
    }
    await renderSessionsList(); // update list after delete
  } catch {
    alert("Network error while deleting session.");
  }
}

// ================= ALERTS =================
async function loadAlerts() {
  const alertsList = document.getElementById("alerts-list");
  if (!alertsList) {
    console.error("alertsList not found in DOM");
    return;
  }

  alertsList.innerHTML = "Loading...";

  try {
    const res = await fetch(`${API_BASE}/api/alerts`);

    console.log("STATUS:", res.status);

    // ❗ Always read as text first (safer)
    const text = await res.text();
    console.log("RAW RESPONSE:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("JSON PARSE ERROR:", parseErr);
      alertsList.innerHTML = "⚠️ Invalid server response.";
      return;
    }

    // ❗ Handle backend error responses
    if (!res.ok || data.error) {
      console.error("API ERROR:", data);
      alertsList.innerHTML = "⚠️ Failed to load alerts.";
      return;
    }

    alertsList.innerHTML = "";

    if (!data.alerts || data.alerts.length === 0) {
      alertsList.innerHTML = "No alerts available.";
      return;
    }

    data.alerts.forEach(a => {
      const card = document.createElement("div");
      card.className = "alert-card";

      card.innerHTML = `
        <strong>${a.title || "No title"}</strong><br>
        <small>${a.source || "Unknown source"}</small><br>
        ${
          a.url
            ? `<a href="${a.url}" target="_blank">Open</a>`
            : ""
        }
      `;

      alertsList.appendChild(card);
    });

  } catch (err) {
    console.error("FETCH ERROR:", err);
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
  localStorage.setItem("qc", "10");
  localStorage.setItem("sa", "5");
  renderCredits(); // Ensure credits are shown on load

  // Selected DOM elements
const addTopicBtn = document.getElementById("add-topic-btn");
const topicInput = document.getElementById("topic-input");
const trackingTagsContainer = document.getElementById("tracking-tags");
const alertFeed = document.getElementById("alert-feed");
const smartAlertsCheckbox = document.getElementById("smartAlerts");
const refreshAlertsBtn = document.getElementById("refresh-alerts-btn");

// Array to hold tracked topics
let trackedTopics = [];

// Function to add a new topic
function addTopic() {
  const topic = topicInput.value.trim();
  if (!topic || trackedTopics.includes(topic)) return;

  trackedTopics.push(topic);

  const tag = document.createElement("div");
  tag.className = "tracking-tag";
  tag.innerHTML = `
    <span>${topic}</span>
    <button class="remove-tag-btn" style="background:none; border:none; color:#fff; cursor:pointer;">✖️</button>
  `;
  // Remove button handler
  tag.querySelector("button").onclick = () => {
    trackedTopics = trackedTopics.filter(t => t !== topic);
    trackingTagsContainer.removeChild(tag);
  };

  trackingTagsContainer.appendChild(tag);
  topicInput.value = "";
}

// Function to load alerts based on topics and smart alert toggle
async function loadAlerts() {
  alertFeed.innerHTML = "Loading...";
  // Example: Send tracked topics and alert mode to API
  try {
    const response = await apiRequest("/api/alerts", {
      method: "POST",
      body: JSON.stringify({
        topics: trackedTopics,
        smart: smartAlertsCheckbox.checked
      }),
      headers: { "Content-Type": "application/json" }
    });
    alertFeed.innerHTML = "";
    (response.alerts || []).forEach(a => {
      const card = document.createElement("div");
      card.className = "alert-item";
      card.innerHTML = `
        <strong>${a.title}</strong><br>
        <small>${a.source || ""}</small><br>
        <a href="${a.url}" target="_blank">Open</a>
      `;
      alertFeed.appendChild(card);
    });
    if (!(response.alerts && response.alerts.length)) {
      alertFeed.innerHTML = "No alerts available.";
    }
  } catch {
    alertFeed.innerHTML = "⚠️ Network error loading alerts.";
  }
}

// Event listener for adding a topic
addTopicBtn.onclick = () => addTopic();

// Event listener for refresh button
refreshAlertsBtn.onclick = () => loadAlerts();

// Event listener for smart alerts toggle
smartAlertsCheckbox.onchange = () => {
  // Optionally, reload alerts when toggling
  loadAlerts();
};
  });
