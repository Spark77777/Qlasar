from fastapi import FastAPI, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request

app = FastAPI()

# serve static files (React build)
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/chat")
async def chat(message: str = Form(...)):
    return {"reply": f"Qlasar says: I received '{message}'"}

@app.post("/proactive")
async def proactive(topic: str = Form(...)):
    return {"reply": f"Latest insights on '{topic}': [demo signals, facts, insights]"}
