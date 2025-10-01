function appendMessage(msg, type) {
    const chatbox = document.getElementById("chatbox");
    const div = document.createElement("div");
    div.className = "message " + type;
    div.textContent = msg;
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
    const input = document.getElementById("userInput");
    const msg = input.value.trim();
    if (!msg) return;
    appendMessage(msg, "user");
    input.value = "";

    const response = await fetch("/chat", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `user_id=test_user&message=${encodeURIComponent(msg)}`
    });
    const data = await response.json();
    appendMessage(data.reply, "bot");
}

async function getInsights() {
    const topicInput = document.getElementById("topicInput");
    const topic = topicInput.value.trim();
    if (!topic) return;

    const response = await fetch("/proactive", {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: `topic=${encodeURIComponent(topic)}`
    });
    const data = await response.json();
    const output = document.getElementById("scoutOutput");
    output.textContent = data.reply;
}
