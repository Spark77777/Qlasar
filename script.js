const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const header = document.querySelector('header');

// --- Sidebar container for proactive alerts ---
const alertsContainer = document.getElementById('alerts-container');

// --- Fetch real alerts from backend (NewsAPI proxy) ---
async function fetchTechAlerts() {
  try {
    const res = await fetch("https://qlasar-qx6y.onrender.com/api/alerts");
    const data = await res.json();

    console.log("Alerts API response:", data); // Debug log

    alertsContainer.innerHTML = ""; // Clear old alerts

    if (data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
      const titles = new Set(); // Prevent duplicates

      data.alerts.forEach(alertObj => {
        const title =
          typeof alertObj === "object"
            ? alertObj.title || alertObj.text || "Untitled Alert"
            : alertObj;

        // Skip duplicate titles
        if (titles.has(title)) return;
        titles.add(title);

        const description =
          typeof alertObj === "object" && alertObj.description
            ? alertObj.description
            : "";

        const source =
          typeof alertObj === "object" && alertObj.source
            ? `<p class="source"><strong>Source:</strong> ${alertObj.source}</p>`
            : "";

        const link =
          typeof alertObj === "object" && alertObj.link
            ? `<a href="${alertObj.link}" target="_blank">Read more →</a>`
            : "";

        // --- Create the alert card ---
        const alertCard = document.createElement('div');
        alertCard.classList.add('alert-card');
        alertCard.innerHTML = `
          <div class="alert-header">
            <h3 class="alert-title">${title}</h3>
            <span class="arrow">▼</span>
          </div>
          <div class="alert-details" style="display: none;">
            ${description ? `<p>${description}</p>` : ""}
            ${source}
            ${link}
          </div>
        `;

        // --- Expand/Collapse Behavior ---
        alertCard.addEventListener("click", () => {
          const details = alertCard.querySelector('.alert-details');
          const arrow = alertCard.querySelector('.arrow');
          const isExpanded = alertCard.classList.toggle('expanded');
          details.style.display = isExpanded ? "block" : "none";
          arrow.style.transform = isExpanded ? "rotate(180deg)" : "rotate(0deg)";
        });

        alertsContainer.appendChild(alertCard);
      });
    } else {
      alertsContainer.innerHTML = `<div class="alert">No new alerts right now.</div>`;
    }
  } catch (err) {
    console.error("Error fetching tech alerts:", err);
    alertsContainer.innerHTML = `<div class="alert">⚠️ Failed to load alerts</div>`;
  }
}

// --- Fetch alerts on page load ---
fetchTechAlerts();

// --- Toggle sidebar visibility ---
let sidebarVisible = false;
header.addEventListener('click', () => {
  sidebarVisible = !sidebarVisible;
  const sidebar = document.getElementById('sidebar');
  sidebar.style.left = sidebarVisible ? '0' : '-300px';
});

// --- Chat logic ---
sendBtn.addEventListener('click', sendMessage);

input.addEventListener('keydown', function (e) {
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

  // --- User message ---
  const userMsg = document.createElement('div');
  userMsg.classList.add('message', 'user');
  userMsg.textContent = text;
  chatWindow.appendChild(userMsg);

  input.value = '';
  input.style.height = 'auto';
  scrollToBottom();

  // --- AI typing indicator ---
  const aiMsg = document.createElement('div');
  aiMsg.classList.add('message', 'ai', 'typing');
  aiMsg.textContent = "";
  chatWindow.appendChild(aiMsg);
  scrollToBottom();

  try {
    const messages = [];
    document.querySelectorAll('.message').forEach(msg => {
      if (msg.classList.contains('user'))
        messages.push({ sender: 'user', text: msg.textContent });
      else if (msg.classList.contains('ai'))
        messages.push({ sender: 'ai', text: msg.textContent });
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
