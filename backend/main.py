from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI()

# Mount static folder for serving frontend
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

@app.get("/")
async def serve_frontend():
    index_path = os.path.join("backend", "static", "index.html")
    return FileResponse(index_path)

@app.get("/health")
def health():
    return {"message": "Qlasar backend is running"}
