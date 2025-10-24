const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const header = document.querySelector('header');

// --- Create sidebar dynamically ---
const sidebar = document.createElement('div');
sidebar.id = 'sidebar';
sidebar.innerHTML = `
  <h2>Proactive Alerts</h2>
  <div id="alerts-container"></div>
`;
document.body.appendChild(sidebar);

const alertsContainer = document.getElementById('alerts-container');

// --- Dummy alerts for immediate display ---
const dummyAlerts = [
  { title: "Crypto prices are rising!", summary: "Bitcoin and Ethereum surge amid bullish sentiment." },
  { title: "New anime episode released today.", summary: "Fans excited as latest episode of 'Q-Tech' drops online." },
  { title: "Trending music track: 'Echoes of Time'.", summary: "The new single is dominating global streaming charts." },
  { title: "Stock market update: Tech sector up 2%.", summary: "Tech giants lead market recovery today with strong earnings." }
];

// --- Function to render alerts ---
function renderAlerts(alerts) {
  alertsContainer.innerHTML = ""; // Clear old alerts

  if (alerts && alerts.length > 0) {
    alerts.forEach(alertObj => {
      const alert = document.createElement('div');
      alert.classList.add('alert');

      // Title
      const title = document.createElement('div');
      title.classList.add('alert-title');
      title.textContent = alertObj.title || alertObj; // fallback to string

      // Summary
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

// --- Render dummy alerts immediately ---
renderAlerts(dummyAlerts);

// --- Fetch real alerts from backend ---
async function fetchTechAlerts() {
  try {
    const res = await fetch("https://qlasar-qx6y.onrender.com/api/alerts");
    const data = await res.json();

    // Expecting either array of objects or string of alerts
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

// --- Fetch alerts once on page load ---
fetchTechAlerts();

// --- Toggle sidebar on clicking header ---
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
