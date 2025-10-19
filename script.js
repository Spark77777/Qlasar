// support two possible textarea ids (message-input or user-input)
const input = document.getElementById('message-input') || document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');

if (!input || !sendBtn || !chatWindow) {
  console.error('Required DOM elements not found. Ensure IDs: message-input or user-input, send-btn, chat-window.');
}

// Helper: escape HTML to prevent injection
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Convert newlines to <br> and escape HTML
function nl2brEscaped(text) {
  const escaped = escapeHtml(text);
  return escaped.replace(/\n/g, "<br>");
}

// Auto-expand textarea height (keeps behavior you had)
function autoExpand() {
  input.style.height = 'auto';
  const newHeight = Math.min(input.scrollHeight, 120); // keep max-height consistent with CSS
  input.style.height = newHeight + 'px';
}

// Smooth scroll helper
function scrollToBottom() {
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
}

// Send logic (preserves multiline)
function sendMessage() {
  // preserve internal newlines; remove \r for consistency and trim ends
  const raw = (input.value || "").replace(/\r/g, "");
  const text = raw.trim();
  if (!text) return;

  // create user bubble and preserve newlines
  const userMsg = document.createElement('div');
  userMsg.classList.add('message', 'user-message'); // match your CSS classes (user-message)
  userMsg.innerHTML = nl2brEscaped(text);
  chatWindow.appendChild(userMsg);

  // clear input and reset height
  input.value = '';
  input.style.height = 'auto';
  scrollToBottom();

  // AI typing bubble
  const aiMsg = document.createElement('div');
  aiMsg.classList.add('message', 'bot-message'); // match your CSS classes (bot-message)
  aiMsg.innerHTML = '<em>Qlasar is typing...</em>';
  chatWindow.appendChild(aiMsg);
  scrollToBottom();

  // simulate AI response (replace with real API later)
  setTimeout(() => {
    const reply = "Hello! I am Qlasar.\nThis is a sample multiline response.\nWe preserve line breaks.";
    aiMsg.innerHTML = nl2brEscaped(reply);
    scrollToBottom();
  }, 900);
}

// Key handling: Enter adds newline, Ctrl+Enter sends
input.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    sendMessage();
  } else if (e.key === 'Enter' && !e.ctrlKey) {
    // allow newline insertion (default) but ensure textarea grows
    // no preventDefault so newline will be inserted
    // use setTimeout to let newline be inserted, then expand
    setTimeout(autoExpand, 0);
  }
});

// keep auto-expand on input
input.addEventListener('input', autoExpand);

// send button
sendBtn.addEventListener('click', sendMessage);

// ensure initial height is correct
autoExpand();
