import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers import chat

load_dotenv()

app = FastAPI(
    title="Day5-6-Lap--Hackthon-Travel Chatbot API",
    version="1.0.0",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "Travel Chatbot API"}
