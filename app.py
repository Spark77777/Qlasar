import os
from fastapi import FastAPI, Request, Form
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import requests
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# ---------------- Config ----------------
OR_KEY = os.getenv("OPENROUTER_KEY")
MODEL_ID = "x-ai/grok-4-fast:free"
API_URL = "https://openrouter.ai/api/v1/chat/completions"

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

FEEDBACK_URL = "https://docs.google.com/forms/d/e/1FAIpQLScEFE0javLf_TFrm_DhxwGT1Gz3o-gXKmeTbUMttGizQF_FvA/viewform?usp=sf_link"

# ---------------- Static & Templates ----------------
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ---------------- Supabase Sessions ----------------
def load_session(user_id: str):
    response = supabase.table("session").select("*").eq("user_id", user_id).execute()
    if response.data:
        return response.data[0]["history"], response.data[0]["id"]
    else:
        new_session = supabase.table("session").insert({"user_id": user_id, "history": []}).execute()
        return [], new_session.data[0]["id"]

def save_session(session_id: str, history):
    supabase.table("session").update({"history": history}).eq("id", session_id).execute()

# ---------------- Routes ----------------
@app.get("/")
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "feedback_url": FEEDBACK_URL})

@app.post("/chat")
async def chat(user_id: str = Form(...), message: str = Form(...)):
    history, session_id = load_session(user_id)

    system_message = (
        "You are Qlasar, an AI scout. Only for those questions that need detailed and well-structured answer, "
        "provide four sections:\n"
        "1. Answer: main response\n"
        "2. Counterarguments: possible opposing views\n"
        "3. Blindspots: missing considerations or overlooked aspects\n"
        "4. Conclusion: encourage the user to think critically and gain insight\n"
        "Format the response clearly with headings and end with a reflective thought for the user."
        "For simple questions or those questions which do not need detailed or in-depth answer, provide answers as a General AI would. Do not provide answer in four sections. Also do not provide reflective thought."
    )

    messages = [{"role": "system", "content": system_message}]
    for u, b in history:
        messages.append({"role": "user", "content": u})
        messages.append({"role": "assistant", "content": b})
    messages.append({"role": "user", "content": message})

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

    history.append((message, reply))
    save_session(session_id, history)
    return JSONResponse({"reply": reply})

@app.post("/proactive")
async def proactive(topic: str = Form(...)):
    system_message = (
        "You are the Proactive Scout. Provide concise, frequent, and actionable "
        "facts, alerts, and insights about the topic the user enters."
    )
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": f"Provide facts, alerts, and insights about: {topic}"}
    ]
    payload = {
        "model": MODEL_ID,
        "
