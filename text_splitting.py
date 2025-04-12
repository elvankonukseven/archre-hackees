# RAG system for reinsurance data exploration using OpenAI

# === 1. Imports ===
import os
import glob
import json
import re
import sys
import openai
import faiss
import numpy as np
from typing import List, Tuple
from dotenv import load_dotenv
from langchain.document_loaders import UnstructuredFileLoader
from langchain.schema import Document
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai.embeddings import OpenAIEmbeddings as SemanticEmbeddings
from langchain.utilities import SerpAPIWrapper

# === 2. Load API key from .env ===
load_dotenv() 
openai.api_key = os.getenv("OPENAI_API_KEY")
os.environ["SERPAPI_API_KEY"] = os.getenv("SERPAPI_API_KEY")
print("🔑 SerpAPI Key Loaded:", os.getenv("SERPAPI_API_KEY"))

if not openai.api_key:
    raise ValueError("❌ OPENAI_API_KEY not found in .env file.")
if not os.getenv("SERPAPI_API_KEY"):
    print("⚠️ Warning: SERPAPI_API_KEY not found in .env file. Web search will not work.")

# === 3. Load and preprocess documents ===
def preprocess_contract(text: str) -> str:
    lines = text.splitlines()
    grouped_lines = []
    current_line = ""
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if current_line and not re.search(r'[\.;!?]$', current_line):
            current_line += " " + line
        else:
            if current_line:
                grouped_lines.append(current_line.strip())
            current_line = line
    if current_line:
        grouped_lines.append(current_line.strip())
    return "\n".join(grouped_lines).strip()

def load_documents(directory: str) -> List[Document]:
    file_paths = glob.glob(os.path.join(directory, '*'))
    docs = []
    for file_path in file_paths:
        ext = os.path.splitext(file_path)[-1].lower()
        if ext in ['.ndjson', '.json']:
            print(f"Skipping unsupported file format: {file_path}")
            continue
        try:
            loader = UnstructuredFileLoader(file_path)
            loaded_docs = loader.load()
            for doc in loaded_docs:
                doc.metadata["source"] = os.path.basename(file_path)
                doc.page_content = preprocess_contract(doc.page_content)
            docs.extend(loaded_docs)
        except Exception as e:
            print(f"⚠️ Failed to load {file_path}: {e}")
    return docs

# === 4. Semantic chunking ===
def chunk_documents(docs: List[Document]) -> List[Document]:
    embedder = SemanticEmbeddings()
    chunker = SemanticChunker(embeddings=embedder, breakpoint_threshold_type="percentile", breakpoint_threshold_amount=90)
    all_chunks = []
    for doc in docs:
        try:
            chunks = chunker.split_text(doc.page_content)
            if not chunks:
                raise ValueError("No semantic chunks returned")
            for chunk_text in chunks:
                chunk_doc = Document(page_content=chunk_text, metadata=doc.metadata)
                all_chunks.append(chunk_doc)
        except Exception as e:
            print(f"⚠️ Failed semantic chunking for {doc.metadata.get('source')}: {e}")
    return all_chunks

# === 5. Embed and store in FAISS ===
def build_vectorstore(chunks: List[Document]) -> Tuple[FAISS, List[Document]]:
    if not chunks:
        raise ValueError("No chunks to index. Check if documents are loaded and chunked properly.")
    embedding_model = OpenAIEmbeddings()
    vectorstore = FAISS.from_documents(chunks, embedding_model)
    return vectorstore, chunks

# === 6. Set up the LLM + Retrieval QA chain ===
def create_qa_chain(vectorstore: FAISS, llm: ChatOpenAI) -> RetrievalQA:
    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
        return_source_documents=True
    )

# === 7. Ask questions with optional web search ===
def ask_question(query: str, all_chunks: List[Document], llm: ChatOpenAI) -> Tuple[str, List[Document]]:
    # Manual web search trigger
    if "search web:" in query.lower():
        serp = SerpAPIWrapper()
        search_query = query.lower().replace("search web:", "").strip()
        print("🌍 Searching the web for:", search_query)
        response = serp.run(search_query)
        return response, []

    year_matches = re.findall(r"20\d{2}", query)
    filtered_docs = []

    if year_matches:
        print(f"🔎 Filtering chunks based on years in filename: {year_matches}")
        for year in year_matches:
            filtered_docs.extend([doc for doc in all_chunks if year in doc.metadata.get("source", "")])
        if not filtered_docs:
            print("⚠️ No matching documents found. Proceeding with full index.")
            filtered_docs = all_chunks
    else:
        filtered_docs = all_chunks

    vectorstore = FAISS.from_documents(filtered_docs, OpenAIEmbeddings())
    qa_chain = create_qa_chain(vectorstore, llm)
    result = qa_chain({"query": query})
    return result['result'], result['source_documents']

# === 8. Main flow ===
if __name__ == "__main__":
    docs = load_documents("./data/submissions/florida")
    chunks = chunk_documents(docs)
    vectorstore, all_chunks = build_vectorstore(chunks)
    llm = ChatOpenAI(temperature=0.2, model_name="gpt-4")

    while True:
        question = input("\nAsk your reinsurance question (or type 'exit'): ")
        if question.lower() == 'exit':
            break
        answer, sources = ask_question(question, all_chunks, llm)
        print("\nAnswer:\n", answer)
        if sources:
            print("\nSources:")
            for doc in sources:
                print(f"- {doc.metadata.get('source', 'unknown')} | Preview: {doc.page_content[:200]}...")
