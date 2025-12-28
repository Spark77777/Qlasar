const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const chatWindow = document.getElementById("chat-window");

// Sidebar elements
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const qlasarTitle = document.getElementById("qlasar-title");
const alertsContainer = document.getElementById("alerts-container");
const newChatBtn = document.getElementById("new-chat-btn");

// ===============================
// SIDEBAR TOGGLE
// ===============================
function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

qlasarTitle.addEventListener("click", (e) => {
  e.stopPropagation();
  sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
});

overlay.addEventListener("click", closeSidebar);

// ===============================
// WELCOME MESSAGE
// ===============================
function renderWelcomeMessage() {
  chatWindow.innerHTML = "";
  const welcome = document.createElement("div");
  welcome.className = "message ai welcome-message";
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
  closeSidebar();
});

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

  const welcome = document.querySelector(".welcome-message");
  if (welcome) welcome.remove();

  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = text;
  chatWindow.appendChild(userMsg);

  input.value = "";
  input.style.height = "auto";
  scrollToBottom();

  const aiMsg = document.createElement("div");
  aiMsg.className = "message ai";
  aiMsg.textContent = "Thinking…";
  chatWindow.appendChild(aiMsg);
  scrollToBottom();

  try {
    const messages = [];
    document.querySelectorAll(".message").forEach((msg) => {
      if (msg.classList.contains("user"))
        messages.push({ sender: "user", text: msg.textContent });
      else if (msg.classList.contains("ai") && msg !== aiMsg)
        messages.push({ sender: "ai", text: msg.textContent });
    });

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    const data = await res.json();
    aiMsg.textContent = data.reply || "❌ Failed to respond";
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
