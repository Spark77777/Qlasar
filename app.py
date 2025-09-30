import os
import requests
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Load API key
OR_KEY = os.getenv("OPENROUTER_KEY")
MODEL_ID = "x-ai/grok-4-fast:free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

app = FastAPI()

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Home route
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "chat_history": []})

# Chat route
@app.post("/chat", response_class=HTMLResponse)
async def chat(request: Request, user_message: str = Form(...), history: str = Form("[]")):
    import json

    try:
        history = json.loads(history)
    except:
        history = []

    messages = [{"role": "system", "content": "You are Qlasar, an AI scout."}]
    for h in history:
        messages.append({"role": "user", "content": h["user"]})
        messages.append({"role": "assistant", "content": h["bot"]})
    messages.append({"role": "user", "content": user_message})

    payload = {
        "model": MODEL_ID,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 512,
    }

    try:
        resp = requests.post(
            API_URL,
            json=payload,
            headers={"Authorization": f"Bearer {OR_KEY}", "Content-Type": "application/json"},
        )
        resp.raise_for_status()
        data = resp.json()
        reply = data["choices"][0]["message"]["content"]
    except Exception as e:
        reply = f"❌ Error: {str(e)}"

    history.append({"user": user_message, "bot": reply})

    return templates.TemplateResponse("index.html", {"request": request, "chat_history": history})
