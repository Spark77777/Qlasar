const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const header = document.querySelector('header');

// --- Use the existing sidebar from HTML ---
const alertsContainer = document.getElementById('alerts-container');

// --- Fetch dummy tech alerts from backend ---
async function fetchTechAlerts() {
  try {
    const res = await fetch("https://qlasar-qx6y.onrender.com/api/alerts");
    const data = await res.json();

    console.log("Alerts API response:", data); // Debug

    alertsContainer.innerHTML = ""; // Clear old alerts

    if (data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
      data.alerts.forEach(alertObj => {
        const alertCard = document.createElement('div');
        alertCard.classList.add('alert-card');

        // ✅ Handle both object and string alerts
        const title =
          typeof alertObj === "object"
            ? alertObj.title || alertObj.text || "Untitled Alert"
            : alertObj;
        const description =
          typeof alertObj === "object"
            ? alertObj.description || "No details available."
            : "";
        const source =
          typeof alertObj === "object" && alertObj.source
            ? `<p><strong>Source:</strong> ${alertObj.source}</p>`
            : "";
        const link =
          typeof alertObj === "object" && alertObj.link
            ? `<a href="${alertObj.link}" target="_blank">Read more →</a>`
            : "";

        alertCard.innerHTML = `
          <h3 class="alert-title">${title}</h3>
          <div class="alert-details">
            <p>${description}</p>
            ${source}
            ${link}
          </div>
        `;

        // --- Expand/Collapse on click ---
        alertCard.addEventListener("click", () => {
          alertCard.classList.toggle("expanded");
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

// --- Fetch alerts once on page load ---
fetchTechAlerts();

// --- Toggle sidebar on clicking header ---
let sidebarVisible = false;
header.addEventListener('click', () => {
  sidebarVisible = !sidebarVisible;
  const sidebar = document.getElementById('sidebar');
  sidebar.style.left = sidebarVisible ? '0' : '-300px';
});

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
      if (msg.classList.contains('user'))
        messages.push({ sender: 'user', text: msg.textContent });
      else if (msg.classList.contains('ai'))
        messages.push({ sender: 'ai', text: msg.textContent });
    });

    // Call backend API
    const res = await fetch("https://qlasar-qx6y.onrender.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();
    aiMsg.classList.remove('typing');

    // ✅ Use marked to render Markdown
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
