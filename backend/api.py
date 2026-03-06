# api.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag import ask

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.post("/ask")
async def ask_question(body: Question):
    answer, sources = ask(body.question)
    formatted_sources = [
        {
            "filename": s.metadata.get("source", "unknown").split("\\")[-1],
            "page": s.metadata.get("page", "?"),
            "content": s.page_content[:400]
        }
        for s in sources
    ]
    return {"answer": answer, "sources": formatted_sources}