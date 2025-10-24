const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const header = document.querySelector('header');

// --- Create sidebar dynamically ---
const sidebar = document.createElement('div');
sidebar.id = 'sidebar';
sidebar.style.position = 'fixed';
sidebar.style.top = '0';
sidebar.style.left = '-300px';
sidebar.style.width = '300px';
sidebar.style.height = '100%';
sidebar.style.backgroundColor = '#111';
sidebar.style.color = '#fff';
sidebar.style.padding = '15px';
sidebar.style.overflowY = 'auto';
sidebar.style.transition = 'left 0.3s ease';
sidebar.style.zIndex = '1000';
sidebar.innerHTML = `
  <h2 style="margin-top:0;color:#00e0ff;">Proactive Alerts</h2>
  <div id="alerts-container"></div>
`;
document.body.appendChild(sidebar);

const alertsContainer = document.getElementById('alerts-container');

// --- Dummy alerts for immediate display ---
const dummyAlerts = [
  { title: "📰 AI Revolution in 2025", summary: "AI models like Qlasar are changing how humans interact with data." },
  { title: "🚀 SpaceX Launch Successful", summary: "Next-gen Starship prototype completes orbital flight successfully." },
  { title: "💡 Quantum Computing Milestone", summary: "Researchers achieve stable qubit coherence for 30 seconds." },
  { title: "🌐 Tech Stocks Rise", summary: "NASDAQ tech sector surges 3.2% after strong quarterly reports." }
];

// --- Render alerts ---
function renderAlerts(alerts) {
  alertsContainer.innerHTML = ""; // Clear old alerts

  if (alerts && alerts.length > 0) {
    alerts.forEach(alertObj => {
      const alert = document.createElement('div');
      alert.classList.add('alert');
      alert.style.background = '#222';
      alert.style.padding = '10px';
      alert.style.marginBottom = '10px';
      alert.style.borderRadius = '8px';
      alert.style.boxShadow = '0 0 5px rgba(0,255,255,0.2)';

      const title = document.createElement('div');
      title.classList.add('alert-title');
      title.style.fontWeight = 'bold';
      title.style.color = '#00e0ff';
      title.style.marginBottom = '4px';
      title.textContent = alertObj.title || alertObj;

      const summary = document.createElement('div');
      summary.classList.add('alert-summary');
      summary.textContent = alertObj.summary || "";

      alert.appendChild(title);
      if (summary.textContent) alert.appendChild(summary);
      alertsContainer.appendChild(alert);
    });
  } else {
    alertsContainer.innerHTML = `<div class="alert">No new alerts right now.</div>`;
  }
}

// --- Render dummy alerts immediately on load ---
renderAlerts(dummyAlerts);

// --- Try fetching backend alerts after 2 seconds ---
setTimeout(fetchTechAlerts, 2000);

// --- Fetch tech alerts from backend ---
async function fetchTechAlerts() {
  try {
    const res = await fetch("https://qlasar-qx6y.onrender.com/api/alerts");
    const data = await res.json();

    if (data.alerts) {
      if (Array.isArray(data.alerts)) {
        renderAlerts(data.alerts);
      } else if (typeof data.alerts === "string") {
        const alertsArray = data.alerts.split("\n").filter(a => a.trim() !== "");
        const formatted = alertsArray.map(a => ({ title: a }));
        renderAlerts(formatted);
      }
    }
  } catch (err) {
    console.error("Error fetching tech alerts:", err);
  }
}

// --- Toggle sidebar when header clicked ---
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
    const messages = [];
    document.querySelectorAll('.message').forEach(msg => {
      if (msg.classList.contains('user')) messages.push({ sender: 'user', text: msg.textContent });
      else if (msg.classList.contains('ai')) messages.push({ sender: 'ai', text: msg.textContent });
    });

    const res = await fetch("https://qlasar-qx6y.onrender.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    aiMsg.classList.remove('typing');
    aiMsg.innerHTML = data.reply ? marked.parse(data.reply) : "❌ Failed to get response";

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
