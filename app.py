from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI()

# serve static files and HTML templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# in-memory session storage
sessions = {}

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/chat")
async def chat(user_id: str = Form(...), message: str = Form(...)):
    if user_id not in sessions:
        sessions[user_id] = []
    sessions[user_id].append({"role": "user", "content": message})

    # dummy AI reply
    reply = f"Qlasar says: I received '{message}'"

    sessions[user_id].append({"role": "assistant", "content": reply})
    return JSONResponse({"reply": reply})

@app.post("/proactive")
async def proactive(topic: str = Form(...)):
    # simple stub — later we can wire it to ARES
    return JSONResponse({"reply": f"Scouting insights about '{topic}'..."})
