from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import openai  # or openrouter

app = FastAPI()

# --- Static Files Setup ---
BASE_DIR = Path(__file__).resolve().parent
static_dir = BASE_DIR / "static"
templates_dir = BASE_DIR / "templates"

# Mount static folder
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Serve frontend index
@app.get("/", response_class=HTMLResponse)
async def serve_index():
    index_file = static_dir / "index.html"
    return HTMLResponse(index_file.read_text())

# --- Chat API ---
@app.post("/chat")
async def chat(request: Request):
    data = await request.form()
    message = data.get("message", "")

    # Example: Using OpenRouter/Grok API
    # Replace 'YOUR_API_KEY' with your actual key
    import requests
    headers = {"Authorization": "Bearer YOUR_API_KEY"}
    payload = {
        "model": "gpt-4o-mini",  # change to your preferred model
        "messages": [{"role": "user", "content": message}]
    }
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload
    )
    reply = resp.json().get("choices", [{}])[0].get("message", {}).get("content", "")
    return JSONResponse({"reply": reply})
