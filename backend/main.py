import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Allow CORS (frontend-backend communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict this later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Fix: absolute path for static folder
static_dir = os.path.join(os.path.dirname(__file__), "static")

# Debug (will show up in Render logs)
print(f"Static directory resolved to: {static_dir}")

# Mount static files
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
def read_root():
    return {"message": "Qlasar backend is running 🚀"}


@app.get("/ping")
def ping():
    return {"status": "ok", "message": "pong"}
