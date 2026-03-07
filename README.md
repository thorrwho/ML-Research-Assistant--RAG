# ML Research Assistant

A full-stack RAG (Retrieval-Augmented Generation) application that answers questions about Machine Learning, Neural Networks, and Large Language Models using a custom document knowledge base.

![RAG](https://img.shields.io/badge/RAG-LangChain-blue) ![Groq](https://img.shields.io/badge/LLM-Groq%20Llama%203.3-green) ![React](https://img.shields.io/badge/Frontend-React-61dafb) ![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)

## Live Demo

[https://ml-research-assistant-rag.vercel.app/](https://ml-research-assistant-rag.vercel.app/)

---

## How It Works

1. Documents are split into chunks and stored in a ChromaDB vector database
2. User question is received by the FastAPI backend
3. Relevant chunks are retrieved from the vector database
4. Llama 3.3 70B via Groq generates an answer using only the retrieved chunks
5. Answer and cited sources are returned to the React frontend with page references
```
User Question
     |
FastAPI Backend
     |
ChromaDB Vector Search → Top 4 Relevant Chunks
     |
Groq Llama 3.3 70B → Answer
     |
React Frontend (with source citations)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI + Python |
| LLM | Llama 3.3 70B via Groq API |
| Vector DB | ChromaDB |
| RAG Framework | LangChain |
| Frontend Deployment | Vercel |
| Backend Deployment | Render |

---

## Project Structure
```
ML-Research-Assistant--RAG/
├── backend/
│   ├── api.py              # FastAPI endpoints
│   ├── rag.py              # RAG pipeline logic
│   ├── ingest.py           # PDF ingestion script
│   ├── chroma_db/          # Vector database
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── index.css       # Global styles
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
└── README.md
```

---

## Running Locally

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Create .env file and add your Groq API key
echo GROQ_API_KEY=your_key_here > .env

# Add PDFs to a docs/ folder, then run ingestion
python ingest.py

# Start the backend server
uvicorn api:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Knowledge Base

The application is built on Wikipedia PDFs covering three domains:

- Machine Learning
- Neural Networks
- Large Language Models

---

## Features

- Natural language Q&A over custom document collections
- Source citations with exact page numbers for every answer
- Fast inference via Groq API (Llama 3.3 70B)
- Animated WebGL particle background
- Fully responsive interface
- Zero cost to run — no paid APIs required

---

## Author

**Tharini Naveen** — [@thorrwho](https://github.com/thorrwho)
