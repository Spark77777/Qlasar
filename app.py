import os
import gradio as gr
import requests

# Load OpenRouter key from environment
OR_KEY = os.getenv("OPENROUTER_KEY")  # Make sure you set this in Render's environment variables

MODEL_ID = "x-ai/grok-4-fast:free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"
FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLScEFE0javLf_TFrm_DhxwGT1Gz3o-gXKmeTbUMttGizQF_FvA/viewform?usp=sf_link"


# ---------------- Qlasar Chatbot ----------------
def qlasar_respond(user_message, history):
    system_message = (
        "You are Qlasar, an AI scout. Only for those questions that need detailed and well-structured answer, "
        "provide four sections:\n"
        "1. Answer: main response\n"
        "2. Counterarguments: possible opposing views\n"
        "3. Blindspots: missing considerations or overlooked aspects\n"
        "4. Conclusion: encourage the user to think critically and gain insight\n"
        "Format the response clearly with headings and end with a reflective thought for the user. "
        "For simple questions or those questions which do not need detailed or in-depth answer, "
        "provide answers as a General AI would. Do not provide answer in four sections. "
        "Also do not provide reflective thought."
    )

    messages = [{"role": "system", "content": system_message}]
    for u, b in history:
        messages.append({"role": "user", "content": u})
        messages.append({"role": "assistant", "content": b})
    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": MODEL_ID,
        "messages": messages,
        "temperature": 0.7,
        "top_p": 0.95,
        "max_tokens": 2048
    }

    try:
        resp = requests.post(
            API_URL,
            json=payload,
            headers={"Authorization": f"Bearer {OR_KEY}", "Content-Type": "application/json"}
        )
        resp.raise_for_status()
        data = resp.json()
        reply = data["choices"][0]["message"]["content"]
    except Exception as e:
        reply = f"❌ Error: {str(e)}"

    history.append((user_message, reply))
    return history, history


# ---------------- Proactive Scout ----------------
def proactive_scout(topic):
    system_message = (
        "You are the Proactive Scout. Provide concise, frequent, and actionable "
        "facts, alerts, and insights about the topic the user enters. "
        "Keep it clear and informative."
    )
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": f"Provide facts, alerts, and insights about: {topic}"}
    ]

    payload = {
        "model": MODEL_ID,
        "messages": messages,
        "temperature": 0.7,
        "top_p": 0.95,
        "max_tokens": 512
    }

    try:
        resp = requests.post(
            API_URL,
            json=payload,
            headers={"Authorization": f"Bearer {OR_KEY}", "Content-Type": "application/json"}
        )
        resp.raise_for_status()
        data = resp.json()
        reply = data["choices"][0]["message"]["content"]
    except Exception as e:
        reply = f"❌ Error: {str(e)}"

    return reply


# ---------------- Gradio Interface ----------------
with gr.Blocks() as demo:
    gr.Markdown("**Qlasar MVP**")

    with gr.Row():
        # Left: Chatbot
        with gr.Column(scale=2):
            gr.Markdown("### Chat with Qlasar")
            state = gr.State([])
            chatbox = gr.Chatbot(type="messages")  # ✅ use messages format
            with gr.Row():
                txt = gr.Textbox(placeholder="Type your message...", show_label=False, lines=3)
                send = gr.Button("➤")
            clear = gr.Button("Clear")

            txt.submit(qlasar_respond, inputs=[txt, state], outputs=[chatbox, state])
            send.click(qlasar_respond, inputs=[txt, state], outputs=[chatbox, state])
            clear.click(lambda: ([], []), outputs=[chatbox, state])

        # Right: Proactive Scout
        with gr.Column(scale=1):
            gr.Markdown("### Proactive Scout")
            topic_input = gr.Textbox(placeholder="Enter a topic...", show_label=True)
            scout_output = gr.Markdown("Proactive insights will appear here.")
            scout_button = gr.Button("Get Insights")
            scout_button.click(proactive_scout, inputs=topic_input, outputs=scout_output)

    # ---------------- Feedback Link at Bottom ----------------
    gr.Markdown(f"---\n[Give Feedback]({FEEDBACK_URL})")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # ✅ Render requires binding to this port
    demo.launch(server_name="0.0.0.0", server_port=port)
