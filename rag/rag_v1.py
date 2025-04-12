# === 0. Suppress Warnings and Dev Noise ===
import os
import sys
import warnings


# === 1. Imports ===
import glob
import json
import re
import openai
import faiss
from typing import List, Tuple
from dotenv import load_dotenv
from langchain_community.document_loaders import UnstructuredFileLoader
from langchain.schema import Document
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain_experimental.text_splitter import SemanticChunker

from langchain_openai.embeddings import OpenAIEmbeddings as SemanticEmbeddings
from langchain.utilities import SerpAPIWrapper
from TranslateTable import process_file 

from langchain_community.utilities import SerpAPIWrapper

from openai import OpenAI

# === 2. Load API key ===
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# Set up OpenAI API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

os.environ["SERPAPI_API_KEY"] = os.getenv("SERPAPI_API_KEY")
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY not found in .env file.")

# === 3. Preprocessing ===
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

# === 4. Load Documents ===
def load_documents(directory: str) -> List[Document]:
    file_paths = glob.glob(os.path.join(directory, '*'))
    docs = []
    for file_path in file_paths:
        ext = os.path.splitext(file_path)[-1].lower()
        if ext in ['.ndjson', '.json']:
            continue
        if ext in ['.csv', '.xlsx']:
            file_path = process_file(file_path)
        try:
            loader = UnstructuredFileLoader(file_path)
            loaded_docs = loader.load()
            for doc in loaded_docs:
                doc.metadata["source"] = os.path.basename(file_path)
                doc.page_content = preprocess_contract(doc.page_content)
            docs.extend(loaded_docs)
        except:
            continue
    return docs

# === 5. Semantic Chunking ===
def chunk_documents(docs: List[Document]) -> List[Document]:
    embedder = OpenAIEmbeddings()
    chunker = SemanticChunker(embeddings=embedder, breakpoint_threshold_type="percentile", breakpoint_threshold_amount=90)
    all_chunks = []
    for doc in docs:
        try:
            chunks = chunker.split_text(doc.page_content)
            for chunk_text in chunks:
                all_chunks.append(Document(page_content=chunk_text, metadata=doc.metadata))
        except:
            continue
    return all_chunks

# === 6. Save/Load Cached Chunks ===
def save_chunks(chunks: List[Document], filepath: str):
    with open(filepath, 'w') as f:
        json.dump([{"text": d.page_content, "metadata": d.metadata} for d in chunks], f)

def load_chunks(filepath: str) -> List[Document]:
    with open(filepath, 'r') as f:
        data = json.load(f)
        return [Document(page_content=item["text"], metadata=item["metadata"]) for item in data]

def build_or_load_vectorstore(index_path="faiss_index", chunks_path="chunks.json", raw_dir="./data/submissions/florida") -> Tuple[FAISS, List[Document]]:
    if os.path.exists(index_path) and os.path.exists(chunks_path):
        vectorstore = FAISS.load_local(index_path, OpenAIEmbeddings(), allow_dangerous_deserialization=True)
        chunks = load_chunks(chunks_path)
    else:
        docs = load_documents(raw_dir)
        chunks = chunk_documents(docs)
        vectorstore = FAISS.from_documents(chunks, OpenAIEmbeddings())
        vectorstore.save_local(index_path)
        save_chunks(chunks, chunks_path)
    return vectorstore, chunks

# === 7. QA Chain ===
def create_qa_chain(vectorstore: FAISS, llm: ChatOpenAI) -> RetrievalQA:
    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
        return_source_documents=True
    )

# === 8. Ask Questions ===
last_context = {"year": None, "contract_metadata": {}}

def format_serp_results(results: List[dict]) -> str:
    bullet_points = []
    for result in results:
        title = result.get("title")
        link = result.get("link")
        source = result.get("source")
        #snippet = result.get("snippet", "(No summary available)")
        bullet_points.append(f"- **{title}** ({source})\n  \n  - [Read more]({link})") #- {snippet}
    return "\n\n".join(bullet_points)

def ask_question(query: str, all_chunks: List[Document], llm: ChatOpenAI) -> Tuple[str, List[Document]]:
    global last_context

    if "search web:" in query.lower():
        serp = SerpAPIWrapper()
        search_text = query.lower().replace("search web:", "").strip()
        response = serp.run(search_text)

        if isinstance(response, list):
            formatted = format_serp_results(response)
            return formatted, []
        return str(response), []

    year_matches = re.findall(r"20\d{2}", query)
    filtered_docs = []
    if year_matches:
        last_context["year"] = year_matches[0]
        for year in year_matches:
            filtered_docs.extend([doc for doc in all_chunks if year in doc.metadata.get("source", "")])
        if not filtered_docs:
            filtered_docs = all_chunks
    else:
        filtered_docs = all_chunks

    vectorstore = FAISS.from_documents(filtered_docs, OpenAIEmbeddings())
    qa_chain = create_qa_chain(vectorstore, llm)
    result = qa_chain({"query": query})
    return result['result'], result['source_documents']



def run_rag_pipeline(directory: str = "./data/submissions/florida", question: str = ""):
   
    vectorstore, all_chunks = build_or_load_vectorstore()

    llm = ChatOpenAI(temperature=0.2, model_name="gpt-4")

    while True:
        if question.lower() == 'exit':
            break
            
        answer, sources = ask_question(question, all_chunks, llm)

        formatted_sources = f"Sources:\n"
        if sources:
            for doc in sources:
                formatted_sources += f"- {doc.metadata.get('source', 'unknown')} | Preview: {doc.page_content[:200]}...\n" #NE PAS LAISSER EN PLEIN MILIEU DUN MOT
        else:
            formatted_sources = ""
    
        return answer, formatted_sources




def run_rag_writeup():

    year = "2024"

    prompts =["Highlight the main clause-level differences between the 2023 and 2024 versions of the contracts. You are an expert underwriter at a reinsurance company. Given these differences between the contracts, give your insight on the implications of these changes.",
              f"Given the specifics of the {year} reinsurance contract, what macroeconomic and geopolitical factors could present significant risks or opportunities for its renewal? Consider aspects such as inflation trends, interest rate shifts, natural catastrophe frequency, regulatory developments, and global economic outlook. Identify clauses relevant to these macros.",
              f"Search web: legislations {year}",
              f"Search web: inflation {year}",
              f"Search web: interest rate {year}",
              f"Search web: natural disaster {year}",
              f"What regulatory legislative changes have been announced in {year} which could result in future losses being significantly different from historical losses?"
              ]
    answers = ""
    sources = ""
    for prompt in prompts:
       tuple_answer_source = run_rag_pipeline(question=prompt)
       answers += tuple_answer_source[0]
       sources += tuple_answer_source[1]

    
    
    special_prompt = f"You are a professional in reinsurance industry. You are very good at reading reports that contain insights from relevant cedent cases. Given the following insights for a case, make the report clearer and more coherent. It should look like a formal reinsurance report : {answers}" 

   #print first version to compare
    print(answers + "\n\n")

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": special_prompt}
        ],
        max_tokens=1000,
        temperature=0.5
    )

    return response.choices[0].message.content.strip() + "\n" + sources





