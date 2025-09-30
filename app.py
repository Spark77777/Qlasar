import os
import requests
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

# FastAPI app
app = FastAPI()

# Mount static & templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# OpenRouter
OR_KEY = os.getenv("OPENROUTER_KEY")
MODEL_ID = "x-ai/grok-4-fast:free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/chat")
async def chat(user_message: str = Form(...), history: str = Form("[]")):
    try:
        system_message = (
            "You are Qlasar, an AI scout. Only for those questions that need detailed and well-structured answer, "
            "provide four sections:\n"
            "1. Answer\n2. Counterarguments\n3. Blindspots\n4. Conclusion\n"
            "For simple questions, answer normally."
        )

        messages = [{"role": "system", "content": system_message}]
        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": MODEL_ID,
            "messages": messages,
            "temperature": 0.7,
            "top_p": 0.95,
            "max_tokens": 2048,
        }

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

    return JSONResponse({"reply": reply})

@app.post("/scout")
async def scout(topic: str = Form(...)):
    try:
        system_message = (
            "You are the Proactive Scout. Provide concise, frequent, and actionable "
            "facts, alerts, and insights about the topic."
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
            "max_tokens": 512,
        }

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

    return JSONResponse({"reply": reply})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
