const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const chatWindow = document.getElementById('chat-window');

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  // Add user message
  const userMsg = document.createElement('div');
  userMsg.classList.add('message', 'user');
  userMsg.textContent = text;
  chatWindow.appendChild(userMsg);

  input.value = '';
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Add AI placeholder reply
  const aiMsg = document.createElement('div');
  aiMsg.classList.add('message', 'ai');
  aiMsg.textContent = "Qlasar is thinking...";
  chatWindow.appendChild(aiMsg);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Simulate AI response
  setTimeout(() => {
    aiMsg.textContent = "Hello! I am Qlasar. I will answer your questions soon.";
  }, 1000);
}
