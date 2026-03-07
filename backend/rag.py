# rag.py
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.embeddings import FakeEmbeddings

load_dotenv()

embeddings = FakeEmbeddings(size=384)

vectorstore = Chroma(
    persist_directory="chroma_db",
    embedding_function=embeddings
)

retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

PROMPT_TEMPLATE = """You are a helpful assistant. Here are some document chunks that may or may not be relevant.
Use them to answer the question as best you can.
Even if the context seems unrelated, try to extract any useful information from it.
If there is truly nothing useful, say "I couldn't find that in the provided documents."

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
