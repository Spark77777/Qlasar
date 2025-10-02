import os
import httpx
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

OPENROUTER_KEY = os.getenv("OPENROUTER_KEY")
if not OPENROUTER_KEY:
    raise RuntimeError("Please set OPENROUTER_KEY environment variable.")

app = FastAPI()

# Serve frontend build
app.mount("/static", StaticFiles(directory="backend/static"), name="static")
templates = Jinja2Templates(directory="backend/templates")

@app.get("/", response_class=HTMLResponse)
async def serve_frontend(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Chat request schema
class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "x.ai/grok-beta",   # ⚡ free Grok Fast model
                    "messages": [{"role": "user", "content": req.message}],
                },
                timeout=60.0,
            )
        data = resp.json()
        if "choices" in data:
            reply = data["choices"][0]["message"]["content"]
            return JSONResponse({"reply": reply})
        else:
            return JSONResponse({"error": data}, status_code=500)
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
