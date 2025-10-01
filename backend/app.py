from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os, requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files
app.mount("/static", StaticFiles(directory="static"), name="static")

OPENROUTER_KEY = os.getenv("OPENROUTER_KEY")
MODEL_ID = "x-ai/grok-4-fast:free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

history = []

@app.get("/")
async def serve_frontend():
    return FileResponse("static/index.html")

@app.post("/chat")
async def chat(request: Request):
    data = await request.form()
    user_msg = data.get("message", "")
    global history
    messages = [{"role":"user","content":user_msg}]
    payload = {
        "model": MODEL_ID,
        "messages": messages,
        "temperature":0.7,
        "max_tokens":2048
    }
    try:
        resp = requests.post(API_URL, json=payload, headers={"Authorization": f"Bearer {OPENROUTER_KEY}"})
        resp.raise_for_status()
        reply = resp.json()["choices"][0]["message"]["content"]
    except Exception as e:
        reply = f"❌ Error: {str(e)}"
    history.append((user_msg, reply))
    return JSONResponse({"reply": reply})
