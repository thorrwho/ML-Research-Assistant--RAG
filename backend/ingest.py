# ingest.py
# Run this ONCE to load your PDFs into the vector database

from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

# Step 1: Load all PDFs from the docs/ folder
print("Loading PDFs...")
loader = PyPDFDirectoryLoader("docs/")
documents = loader.load()
print(f"Loaded {len(documents)} pages from your PDFs")

# Step 2: Split into chunks
# Each chunk is ~1000 characters with 200 character overlap
# Overlap means consecutive chunks share some text — preserves context
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)
chunks = splitter.split_documents(documents)
print(f"Split into {len(chunks)} chunks")

# Step 3: Create embeddings using a FREE local model
# 'all-MiniLM-L6-v2' is a small, fast, good quality model
# Downloads ~90MB the first time, then cached forever
print("Loading embedding model (downloads ~90MB first time)...")
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"}
)

# Step 4: Store everything in ChromaDB (saved to disk)
print("Creating vector database...")
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="chroma_db"
)

print("Done! Your vector database is saved in the chroma_db/ folder.")
print(f"Total chunks stored: {len(chunks)}")