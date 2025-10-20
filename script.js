const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const header = document.querySelector('header');

// Create sidebar dynamically
const sidebar = document.createElement('div');
sidebar.id = 'sidebar';
sidebar.innerHTML = `
  <h2>Proactive Alerts</h2>
  <div id="alerts-container"></div>
`;
document.body.appendChild(sidebar);

const alertsContainer = document.getElementById('alerts-container');

// Dummy alerts for demo
const demoAlerts = [
  "Crypto prices are rising!",
  "New anime episode released today.",
  "Trending music track: 'Echoes of Time'.",
  "Stock market update: Tech sector up 2%."
];

// Populate alerts in sidebar
demoAlerts.forEach(alertText => {
  const alert = document.createElement('div');
  alert.classList.add('alert');
  alert.textContent = alertText;
  alertsContainer.appendChild(alert);
});

// Toggle sidebar on clicking header (Qlasar text)
let sidebarVisible = false;
header.addEventListener('click', () => {
  sidebarVisible = !sidebarVisible;
  sidebar.style.left = sidebarVisible ? '0' : '-300px';
});

sendBtn.addEventListener('click', sendMessage);

input.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    sendMessage();
  } else if (e.key === 'Enter' && !e.ctrlKey) {
    autoExpand();
  }
});

// Auto-expand textarea height
input.addEventListener('input', autoExpand);

function autoExpand() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // User message
  const userMsg = document.createElement('div');
  userMsg.classList.add('message', 'user');
  userMsg.textContent = text;
  chatWindow.appendChild(userMsg);

  input.value = '';
  input.style.height = 'auto';
  scrollToBottom();

  // AI typing indicator
  const aiMsg = document.createElement('div');
  aiMsg.classList.add('message', 'ai', 'typing');
  aiMsg.textContent = "";
  chatWindow.appendChild(aiMsg);
  scrollToBottom();

  try {
    // Collect all messages for backend
    const messages = [];
    document.querySelectorAll('.message').forEach(msg => {
      if (msg.classList.contains('user')) messages.push({ sender: 'user', text: msg.textContent });
      else if (msg.classList.contains('ai')) messages.push({ sender: 'ai', text: msg.textContent });
    });

    // Call backend API
    const res = await fetch("https://qlasar-qx6y.onrender.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    aiMsg.classList.remove('typing');
    aiMsg.textContent = data.reply || "❌ Failed to get response";
    scrollToBottom();

  } catch (err) {
    aiMsg.classList.remove('typing');
    aiMsg.textContent = "❌ Error connecting to server";
    console.error(err);
  }
}

function scrollToBottom() {
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
}
