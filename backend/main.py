from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Serve static frontend
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

# Root serves index.html
@app.get("/")
async def root():
    return FileResponse("backend/static/index.html")

# Test endpoint
@app.get("/health")
async def health():
    return {"message": "Qlasar backend is running."}
