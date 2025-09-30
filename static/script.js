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

function appendMessage(msg, type)
