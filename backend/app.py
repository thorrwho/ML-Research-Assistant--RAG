# app.py
# Run this to start the web app: streamlit run app.py

import streamlit as st
from rag import ask

# Page config
st.set_page_config(
    page_title="Document Research Assistant",
    page_icon="📚",
    layout="wide"
)

# Header
st.title("📚 Document Research Assistant")
st.caption("Powered by Llama 3.1 running locally on your machine — 100% free, 100% private")

# Sidebar info
with st.sidebar:
    st.header("About")
    st.info("""
    This app uses RAG (Retrieval-Augmented Generation) to answer 
    questions about your uploaded documents.
    
    **How it works:**
    1. Your question is converted to a vector
    2. Similar chunks are retrieved from the database
    3. Llama 3.1 generates an answer using those chunks
    4. Sources are shown so you can verify
    """)
    st.success("🟢 Running locally — no API costs, no data sent online")

# Keep chat history using session state
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display previous messages
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])
        # Show sources for assistant messages
        if msg["role"] == "assistant" and msg.get("sources"):
            with st.expander(f"📎 View {len(msg['sources'])} source chunks"):
                for i, doc in enumerate(msg["sources"]):
                    page = doc.metadata.get("page", "?")
                    source = doc.metadata.get("source", "unknown")
                    # Show just the filename, not full path
                    filename = source.split("\\")[-1].split("/")[-1]
                    st.markdown(f"**Source {i+1}** — {filename}, page {page}")
                    st.caption(doc.page_content[:400] + "...")
                    if i < len(msg["sources"]) - 1:
                        st.divider()

# Chat input
if question := st.chat_input("Ask anything about your documents..."):

    # Show user message
    with st.chat_message("user"):
        st.write(question)
    st.session_state.messages.append({"role": "user", "content": question})

    # Generate and show answer
    with st.chat_message("assistant"):
        with st.spinner("Searching documents and generating answer..."):
            answer, sources = ask(question)

        st.write(answer)

        # Source citations — this is what makes it a real RAG app
        if sources:
            with st.expander(f"📎 View {len(sources)} source chunks used"):
                for i, doc in enumerate(sources):
                    page = doc.metadata.get("page", "?")
                    source = doc.metadata.get("source", "unknown")
                    filename = source.split("\\")[-1].split("/")[-1]
                    st.markdown(f"**Source {i+1}** — {filename}, page {page}")
                    st.caption(doc.page_content[:400] + "...")
                    if i < len(sources) - 1:
                        st.divider()

    st.session_state.messages.append({
        "role": "assistant",
        "content": answer,
        "sources": sources
    })