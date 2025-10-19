const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const chatWindow = document.getElementById("chat-window");

// Auto-expand textarea height
function autoExpand() {
  input.style.height = "auto";
  const newHeight = Math.min(input.scrollHeight, 120);
  input.style.height = newHeight + "px";
}

// Scroll chat to bottom smoothly
function scrollToBottom() {
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: "smooth" });
}

// Function to send message
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // Create user message bubble
  const userMsg = document.createElement("div");
  userMsg.classList.add("message", "user");
  userMsg.innerHTML = input.value.replace(/\n/g, "<br>"); // Preserve multiline
  chatWindow.appendChild(userMsg);
  scrollToBottom();

  // Clear input
  input.value = "";
  input.style.height = "auto";

  // Create AI message bubble
  const aiMsg = document.createElement("div");
  aiMsg.classList.add("message", "ai");
  aiMsg.textContent = "Qlasar is typing...";
  chatWindow.appendChild(aiMsg);
  scrollToBottom();

  // Simulate AI response
  setTimeout(() => {
    aiMsg.innerHTML = "Hello, I am Qlasar.<br>How can I assist you today?";
    scrollToBottom();
  }, 800);
}

// Handle Enter and Ctrl+Enter
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) {
    e.preventDefault();
    sendMessage();
  } else if (e.key === "Enter" && !e.ctrlKey) {
    // allow newline, just auto expand
    setTimeout(autoExpand, 0);
  }
});

// Listeners
input.addEventListener("input", autoExpand);
sendBtn.addEventListener("click", sendMessage);
