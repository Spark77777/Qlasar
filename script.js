const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const chatWindow = document.getElementById("chat-window");

// Auto-expand textarea
function autoExpand() {
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 120) + "px";
}

// Scroll to bottom
function scrollToBottom() {
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });
}

// Send message function
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // User bubble
  const userMsg = document.createElement("div");
  userMsg.classList.add("message", "user");
  userMsg.innerHTML = input.value.replace(/\n/g, "<br>");
  chatWindow.appendChild(userMsg);
  scrollToBottom();

  // Clear input
  input.value = "";
  autoExpand();

  // AI typing placeholder
  const aiMsg = document.createElement("div");
  aiMsg.classList.add("message", "ai", "typing");
  aiMsg.innerHTML = "<span></span>";
  chatWindow.appendChild(aiMsg);
  scrollToBottom();

  // Simulate AI response
  setTimeout(() => {
    aiMsg.classList.remove("typing");
    const reply = "Hello! I am Qlasar.\nThis is a multiline example.\nYour messages stay formatted.";
    aiMsg.innerHTML = reply.replace(/\n/g, "<br>");
    scrollToBottom();
  }, 1200);
}

// Key handling: Enter = newline, Ctrl+Enter = send
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) { e.preventDefault(); sendMessage(); }
  else if (e.key === "Enter" && !e.ctrlKey) { setTimeout(autoExpand, 0); }
});

// Listeners
input.addEventListener("input", autoExpand);
sendBtn.addEventListener("click", sendMessage);
