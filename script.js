const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');

sendBtn.addEventListener('click', sendMessage);

input.addEventListener('keydown', function(e) {
  // Ctrl + Enter to send
  if (e.key === 'Enter' && e.ctrlKey) {
    e.preventDefault();
    sendMessage();
  } else if (e.key === 'Enter' && !e.ctrlKey) {
    // Enter alone just adds newline
    autoExpand();
  }
});

// Auto-expand textarea height
input.addEventListener('input', autoExpand);

function autoExpand() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
}

function sendMessage() {
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
  aiMsg.classList.add('message', 'ai');
  aiMsg.textContent = "Qlasar is thinking...";
  chatWindow.appendChild(aiMsg);
  scrollToBottom();

  // Simulate AI response
  setTimeout(() => {
    aiMsg.textContent = "Hello! I am Qlasar. I will answer your questions soon.";
    scrollToBottom();
  }, 1200);
}

function scrollToBottom() {
  chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
}
