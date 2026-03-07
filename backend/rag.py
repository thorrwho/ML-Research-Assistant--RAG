# rag.py
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import FakeEmbeddings
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

load_dotenv()

# Use FakeEmbeddings that matches the dimension of all-MiniLM-L6-v2 (384)
embeddings = FakeEmbeddings(size=384)

vectorstore = Chroma(
    persist_directory="chroma_db",
    embedding_function=embeddings
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

PROMPT_TEMPLATE = """You are a helpful assistant. Answer the question using ONLY 
the information provided in the context below. 

If the answer is not in the context, say exactly: 
"I couldn't find that in the provided documents."

Do not make up information. Be concise and accurate.

Context:
{context}

Question: {question}

Answer:"""

prompt = PromptTemplate(
    template=PROMPT_TEMPLATE,
    input_variables=["context", "question"]
)

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

def ask(question: str):
    sources = retriever.invoke(question)
    answer = chain.invoke(question)
    return answer, sources
```

Also update `backend/requirements.txt` on GitHub — remove `sentence-transformers` and `langchain-huggingface`:
```
fastapi
uvicorn
langchain
langchain-community
langchain-groq
langchain-text-splitters
langchain-core
chromadb
pypdf
python-dotenv
