const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');
const header = document.querySelector('header');

// --- Sidebar container for alerts ---
const alertsContainer = document.getElementById('alerts-container');

// --- Fetch real tech alerts from backend ---
async function fetchTechAlerts() {
  try {
    const res = await fetch("https://qlasar-qx6y.onrender.com/api/alerts");
    const data = await res.json();

    console.log("Alerts API response:", data); // Debug log

    alertsContainer.innerHTML = ""; // Clear old alerts

    if (data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
      data.alerts.forEach(alertObj => {
        const alertCard = document.createElement('div');
        alertCard.classList.add('alert-card');

        // Handle both object and string alerts
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
          </div>
        `;

        // --- Expand/Collapse with popup ---
        alertCard.addEventListener("click", () => {
          // If clicked again, collapse it and remove popup
          if (alertCard.classList.contains("expanded")) {
            alertCard.classList.remove("expanded");
            const existingPopup = document.querySelector(".alert-popup");
            if (existingPopup) existingPopup.remove();
            return;
          }

          // Collapse any other open alert
          document.querySelectorAll(".alert-card.expanded").forEach(card => {
            card.classList.remove("expanded");
          });

          alertCard.classList.add("expanded");

          // Remove any existing popup
          const existingPopup = document.querySelector(".alert-popup");
          if (existingPopup) existingPopup.remove();

          // Create popup with full details
          const popup = document.createElement("div");
          popup.classList.add("alert-popup");
          popup.innerHTML = `
            <h3>${title}</h3>
            <p>${description}</p>
            ${source}
            ${link}
          `;

          // Append popup after the clicked card
          alertCard.insertAdjacentElement("afterend", popup);

          // Smooth scroll into view
          popup.scrollIntoView({ behavior: "smooth", block: "center" });
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

    // Render Markdown response
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
