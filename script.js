const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');

// --- Sidebar elements ---
const sidebar = document.getElementById('sidebar');
const qlasarTitle = document.getElementById('qlasar-title');
const alertsContainer = document.getElementById('alerts-container');
const newChatBtn = document.getElementById('new-chat-btn');

// ===============================
// SIDEBAR TOGGLE (ONLY QLASAR TEXT)
// ===============================
let sidebarVisible = false;

qlasarTitle.addEventListener('click', (e) => {
  e.stopPropagation();
  sidebarVisible = !sidebarVisible;
  sidebar.style.left = sidebarVisible ? '0' : '-300px';
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
  if (sidebarVisible && !sidebar.contains(e.target) && e.target !== qlasarTitle) {
    sidebar.style.left = '-300px';
    sidebarVisible = false;
  }
});

// ===============================
// NEW CHAT LOGIC
// ===============================
newChatBtn.addEventListener('click', () => {
  chatWindow.innerHTML = '';
  sidebar.style.left = '-300px';
  sidebarVisible = false;

  const welcome = document.createElement('div');
  welcome.classList.add('message', 'ai');
  welcome.textContent = "Hello! I am Qlasar. Ask me anything.";
  chatWindow.appendChild(welcome);
});

// ===============================
// PROACTIVE ALERTS FETCH
// ===============================
async function fetchTechAlerts() {
  try {
    const res = await fetch("https://qlasar-qx6y.onrender.com/api/alerts");
    const data = await res.json();

    alertsContainer.innerHTML = "";

    if (Array.isArray(data.alerts) && data.alerts.length > 0) {
      const titles = new Set();

      data.alerts.forEach(alertObj => {
        const title =
          typeof alertObj === "object"
            ? alertObj.title || alertObj.text || "Untitled Alert"
            : alertObj;

        if (titles.has(title)) return;
        titles.add(title);

        const description = alertObj.description || "";
        const source = alertObj.source
          ? `<p class="source"><strong>Source:</strong> ${alertObj.source}</p>`
          : "";
        const link = alertObj.link
          ? `<a href="${alertObj.link}" target="_blank">Read more →</a>`
          : "";

        const alertCard = document.createElement('div');
        alertCard.classList.add('alert-card');
        alertCard.innerHTML = `
          <div class="alert-header">
            <h3 class="alert-title">${title}</h3>
            <span class="arrow">▼</span>
          </div>
          <div class="alert-details">
            ${description ? `<p>${description}</p>` : ""}
            ${source}
            ${link}
          </div>
        `;

        const details = alertCard.querySelector('.alert-details');
        const arrow = alertCard.querySelector('.arrow');
        details.style.display = "none";

        alertCard.querySelector('.alert-header').addEventListener('click', () => {
          const expanded = details.style.display === "block";
          details.style.display = expanded ? "none" : "block";
          arrow.style.transform = expanded ? "rotate(0deg)" : "rotate(180deg)";
        });

        alertsContainer.appendChild(alertCard);
      });
    } else {
      alertsContainer.innerHTML = `<div class="alert">No new alerts right now.</div>`;
    }
  } catch (err) {
    console.error(err);
    alertsContainer.innerHTML = `<div class="alert">⚠️ Failed to load alerts</div>`;
  }
}

fetchTechAlerts();

// ===============================
// CHAT LOGIC
// ===============================
sendBtn.addEventListener('click', sendMessage);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    sendMessage();
  } else if (e.key === 'Enter') {
    autoExpand();
  }
});

input.addEventListener('input', autoExpand);

function autoExpand() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const userMsg = document.createElement('div');
  userMsg.classList.add('message', 'user');
  userMsg.textContent = text;
  chatWindow.appendChild(userMsg);

  input.value = '';
  input.style.height = 'auto';
  scrollToBottom();

  const aiMsg = document.createElement('div');
  aiMsg.classList.add('message', 'ai', 'typing');
  chatWindow.appendChild(aiMsg);
  scrollToBottom();

  try {
    const messages = [];
    document.querySelectorAll('.message').forEach(msg => {
      if (msg.classList.contains('user'))
        messages.push({ sender: 'user', text: msg.textContent });
      else if (msg.classList.contains('ai') && !msg.classList.contains('typing'))
        messages.push({ sender: 'ai', text: msg.textContent });
    });

    const res = await fetch("https://qlasar-qx6y.onrender.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    aiMsg.classList.remove('typing');
    aiMsg.innerHTML = data.reply ? marked.parse(data.reply) : "❌ Failed to respond";
    scrollToBottom();

  } catch (err) {
    aiMsg.classList.remove('typing');
    aiMsg.textContent = "❌ Server error";
  }
}

function scrollToBottom() {
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
            }
