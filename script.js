const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const title = document.getElementById("qlasar-title");

const chatSection = document.getElementById("chat-section");
const alertsSection = document.getElementById("alerts-section");

const chatWindow = document.getElementById("chat-window");
const sendBtn = document.getElementById("send-btn");
const input = document.getElementById("message-input");

const alertsList = document.getElementById("alerts-list");

// toggle sidebar
title.onclick = () => {
  sidebar.style.left = "0";
  overlay.classList.add("show");
};
overlay.onclick = () => {
  sidebar.style.left = "-260px";
  overlay.classList.remove("show");
};

// welcome message
function welcome(){
  chatWindow.innerHTML = "";
  const w = document.createElement("div");
  w.className = "message ai";
  w.innerText = "Hello! I’m Qlasar — ask me anything.";
  chatWindow.appendChild(w);
}
welcome();

// New Chat
document.getElementById("new-chat").onclick = () => {
  welcome();
  closeSidebar();
};

// show alerts panel
document.getElementById("show-alerts").onclick = () => {
  chatSection.classList.add("hidden");
  alertsSection.classList.remove("hidden");
  closeSidebar();
  loadAlerts();
};

// close sidebar helper
function closeSidebar(){
  sidebar.style.left = "-260px";
  overlay.classList.remove("show");
}

// back to chat when typing alerts not needed
document.getElementById("show-sessions").onclick = () => alert("Session storage coming soon");
document.getElementById("account-btn").onclick = () => alert("Auth coming soon");

// chat send
sendBtn.onclick = send;

async function send(){
  const text = input.value.trim();
  if(!text) return;

  // show user msg
  const u = document.createElement("div");
  u.className = "message user";
  u.innerText = text;
  chatWindow.appendChild(u);

  input.value = "";

  // thinking msg
  const a = document.createElement("div");
  a.className = "message ai";
  a.innerText = "Thinking...";
  chatWindow.appendChild(a);

  const res = await fetch("/api/generate", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify({ messages:[{sender:"user",text}] })
  });

  const data = await res.json();
  a.innerText = data.reply || "Error";
}

// alerts loader
async function loadAlerts(){
  alertsList.innerHTML = "Loading...";

  const res = await fetch("/api/alerts");
  const data = await res.json();

  alertsList.innerHTML = "";

  data.alerts.forEach(a=>{
    const card = document.createElement("div");
    card.className="alert-card";
    card.innerHTML = `
      <strong>${a.title}</strong><br>
      <small>${a.source||""}</small><br>
      <a href="${a.url}" target="_blank">Open</a>
    `;
    alertsList.appendChild(card);
  });
    }
