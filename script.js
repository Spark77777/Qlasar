const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const chatWindow = document.getElementById("chat-window");

// Sidebar elements
const sidebar = document.getElementById("sidebar");
const qlasarTitle = document.getElementById("qlasar-title");
const alertsContainer = document.getElementById("alerts-container");
const newChatBtn = document.getElementById("new-chat-btn");

// ===============================
// INITIAL STATE
// ===============================
let sidebarVisible = false;
sidebar.style.transform = "translateX(-100%)";

// ===============================
// SIDEBAR TOGGLE (QLASAR LOGO ONLY)
// ===============================
qlasarTitle.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebarVisible = !sidebarVisible;
  sidebar.style.transform = sidebarVisible
    ? "translateX(0)"
    : "translateX(-100%)";
});

// Close sidebar when clicking outside
document.addEventListener("click", (e) => {
  if (
    sidebarVisible &&
    !sidebar.contains(e.target) &&
    !qlasarTitle.contains(e.target)
  ) {
    sidebar.style.transform = "translateX(-100%)";
    sidebarVisible = false;
  }
});

// ===============================
// WELCOME MESSAGE
// ===============================
function renderWelcomeMessage() {
  chatWindow.innerHTML = "";
  const welcome = document.createElement("div");
  welcome.className = "message ai welcome";
  welcome.textContent =
    "Hello 👋 I’m Qlasar. I proactively scout information so you don’t have to.";
  chatWindow.appendChild(welcome);
}

renderWelcomeMessage();

// ===============================
// NEW CHAT
// ===============================
newChatBtn.addEventListener("click", () => {
  renderWelcomeMessage();
  sidebar.style.transform = "translateX(-100%)";
  sidebarVisible = false;
});

// ===============================
// PROACTIVE ALERTS
// ===============================
async function fetchTechAlerts() {
  try {
    const res = await fetch("/api/alerts");
    const data = await res.json();

    alertsContainer.innerHTML = "";

    if (!Array.isArray(data.alerts) || data.alerts.length === 0) {
      alertsContainer.innerHTML =
        "<div class='alert'>No new alerts right now</div>";
      return;
    }

    const seen = new Set();

    data.alerts.forEach((alert) => {
      if (seen.has(alert.title)) return;
      seen.add(alert.title);

      const card = document.createElement("div");
      card.className = "alert-card";

      card.innerHTML = `
        <div class="alert-header">
          <h3>${alert.title}</h3>
          <span class="arrow">⌄</span>
        </div>
        <div class="alert-details">
          ${alert.summary ? `<p>${alert.summary}</p>` : ""}
          ${alert.source ? `<p class="source">Source: ${alert.source}</p>` : ""}
          ${alert.url ? `<a href="${alert.url}" target="_blank">Read more →</a>` : ""}
        </div>
      `;

      const details = card.querySelector(".alert-details");
      const arrow = card.querySelector(".arrow");
      details.style.display = "none";

      card.querySelector(".alert-header").onclick = () => {
        const open = details.style.display === "block";
        details.style.display = open ? "none" : "block";
        arrow.style.transform = open ? "rotate(0deg)" : "rotate(180deg)";
      };

      alertsContainer.appendChild(card);
    });
  } catch {
    alertsContainer.innerHTML =
      "<div class='alert'>⚠️ Failed to load alerts</div>";
  }
}

fetchTechAlerts();

// ===============================
// CHAT LOGIC
// ===============================
sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

input.addEventListener("input", autoExpand);

function autoExpand() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 120) + "px";
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const welcome = document.querySelector(".welcome");
  if (welcome) welcome.remove();

  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = text;
  chatWindow.appendChild(userMsg);

  input.value = "";
  input.style.height = "auto";
  scrollToBottom();

  const aiMsg = document.createElement("div");
  aiMsg.className = "message ai typing";
  aiMsg.textContent = "Thinking…";
  chatWindow.appendChild(aiMsg);
  scrollToBottom();

  try {
    const messages = [];
    document.querySelectorAll(".message").forEach((msg) => {
      if (msg.classList.contains("user"))
        messages.push({ sender: "user", text: msg.textContent });
      else if (msg.classList.contains("ai") && !msg.classList.contains("typing"))
        messages.push({ sender: "ai", text: msg.textContent });
    });

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();
    aiMsg.classList.remove("typing");
    aiMsg.innerHTML = data.reply || "❌ Failed to respond";
    scrollToBottom();
  } catch {
    aiMsg.textContent = "❌ Server error";
  }
}

function scrollToBottom() {
  chatWindow.scrollTo({
    top: chatWindow.scrollHeight,
    behavior: "smooth",
  });
      }
