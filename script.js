// Robust, backward-compatible frontend script for Qlasar chat UI.
// - Enter = newline, Ctrl+Enter = send
// - Preserves multiline (converts \n -> <br> safely)
// - Auto-expands textarea
// - Adds both possible CSS classes for compatibility

// Find the input (tries common ids), send button and chat window
const input = document.getElementById('message-input') || document.getElementById('user-input') || document.querySelector('textarea');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');

if (!input || !sendBtn || !chatWindow) {
  console.error('script.js: required elements missing. Expect IDs: message-input or user-input (textarea), send-btn, chat-window.');
}

// Escape HTML to avoid injection
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Convert newlines to <br> safely
function nl2brEscaped(text) {
  return escapeHtml(text).replace(/\n/g, "<br>");
}

// Auto-expand textarea height with a reasonable max
function autoExpand() {
  if (!input) return;
  input.style.height = 'auto';
  const max = 200; // px - safe maximum
  const newH = Math.min(input.scrollHeight, max);
  input.style.height = newH + 'px';
}

// Smooth scroll
function scrollToBottom() {
  if (!chatWindow) return;
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
}

// Create and append user message preserving multiline
function appendUserMessage(rawText) {
  const userMsg = document.createElement('div');

  // Add broad set of classes so CSS matches whichever naming you used
  userMsg.classList.add('message');
  userMsg.classList.add('user');         // matches .message.user if present
  userMsg.classList.add('user-message'); // matches .user-message if present

  userMsg.innerHTML = nl2brEscaped(rawText);
  chatWindow.appendChild(userMsg);
  scrollToBottom();
}

// Create and append bot message content (can update later)
function appendBotPlaceholder() {
  const aiMsg = document.createElement('div');
  aiMsg.classList.add('message');
  aiMsg.classList.add('ai');          // matches .message.ai
  aiMsg.classList.add('bot-message'); // matches .bot-message
  aiMsg.innerHTML = '<em>Qlasar is typing...</em>';
  chatWindow.appendChild(aiMsg);
  scrollToBottom();
  return aiMsg;
}

// Main send function
function sendMessage() {
  if (!input) return;
  // keep \n inside, normalize CRLF -> LF
  const raw = (input.value || "").replace(/\r/g, "");
  const trimmed = raw.trim();
  if (!trimmed) return;

  appendUserMessage(raw); // pass raw to preserve internal blank lines

  // clear input and reset height
  input.value = '';
  input.style.height = 'auto';
  autoExpand();

  // add bot placeholder
  const aiMsg = appendBotPlaceholder();

  // simulate response (replace with API call later)
  setTimeout(() => {
    const reply = "Hello! I am Qlasar.\nThis reply preserves line breaks.\nYou can see multiple lines.";
    aiMsg.innerHTML = nl2brEscaped(reply);
    scrollToBottom();
  }, 900);
}

// Key handling: Enter adds newline, Ctrl+Enter sends
if (input) {
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      sendMessage();
    } else if (e.key === 'Enter' && !e.ctrlKey) {
      // let default newline happen; schedule autoExpand after newline inserted
      setTimeout(autoExpand, 0);
    }
  });

  // Auto-expand on input
  input.addEventListener('input', autoExpand);

  // ensure initial size
  setTimeout(autoExpand, 0);
}

// Send button
if (sendBtn) sendBtn.addEventListener('click', sendMessage);
