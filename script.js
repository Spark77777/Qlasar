const qlasarTitle = document.getElementById("qlasar-title");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const chatWindow = document.getElementById("chat-window");
const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const newChatBtn = document.getElementById("new-chat-btn");
const alertsContainer = document.getElementById("alerts-container");

/* SIDEBAR TOGGLE */
qlasarTitle.onclick = () => {
  sidebar.classList.add("open");
  overlay.classList.add("show");
};

overlay.onclick = () => {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};

newChatBtn.onclick = () => {
  chatWindow.innerHTML = `
    <div class="welcome-message">
      <h2>Hello 👋</h2>
      <p>I’m Qlasar. I proactively scout information so you don’t have to.</p>
    </div>
  `;
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
};

/* CHAT */
sendBtn.onclick = sendMessage;

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  input.value = "";

  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.textContent = text;
  chatWindow.appendChild(userMsg);

  const aiMsg = document.createElement("div");
  aiMsg.className = "message ai";
  aiMsg.textContent = "Thinking…";
  chatWindow.appendChild(aiMsg);

  chatWindow.scrollTop = chatWindow.scrollHeight;

  setTimeout(() => {
    aiMsg.textContent = "This is a beta response from Qlasar.";
  }, 1000);
}

/* ALERTS */
alertsContainer.innerHTML = `
  <div class="alert-card">
    <strong>AI News</strong>
    <p>New AI funding rounds detected.</p>
  </div>
`;
