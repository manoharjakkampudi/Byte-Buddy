import os
import requests
from pathlib import Path
from dotenv import load_dotenv
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.chains.combine_documents import create_stuff_documents_chain # type: ignore
from langchain_core.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain

load_dotenv()

# Step 1: Load and split local documents
def load_documents():
    docs = []
    for file in Path("data").glob("*"):
        if file.suffix == ".pdf":
            loader = PyPDFLoader(str(file))
        elif file.suffix == ".md":
            loader = TextLoader(str(file))
        else:
            continue
        docs.extend(loader.load())
    return docs

documents = load_documents()
splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(documents)

# Step 2: Create FAISS vector DB if local docs exist
embeddings = OpenAIEmbeddings()
vector_db = FAISS.from_documents(chunks, embeddings) if chunks else None

# Step 3: Set up LLM and Conversational Chain
llm = ChatOpenAI(temperature=0)
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# Use ConversationalRetrievalChain if vector DB exists
if vector_db:
    retriever = vector_db.as_retriever()
    conv_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        verbose=False
    )

# Prompt for Wikipedia fallback
fallback_prompt = PromptTemplate.from_template("""
Use the context below to answer the question.

Context:
{context}

Question:
{input}
""")
fallback_chain = create_stuff_documents_chain(llm=llm, prompt=fallback_prompt)

# Wikipedia fallback
def fetch_wikipedia_summary(topic: str) -> str:
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{topic}"
    res = requests.get(url)
    if res.status_code == 200:
        return res.json().get("extract", "")
    return ""

# Unified RAG logic with chat memory
def get_answer(question: str):
    if vector_db:
        result = conv_chain.invoke({"question": question})
        return {
            "answer": result["answer"],
            "sources": []  # Optional: enrich with metadata if needed
        }

    # Fallback to Wikipedia
    topic = question.split()[-1].capitalize()
    wiki_summary = fetch_wikipedia_summary(topic)
    if wiki_summary:
        wiki_doc = [{"page_content": wiki_summary, "metadata": {"source": f"Wikipedia: {topic}"}}]
        result = fallback_chain.invoke({"input": question, "context": wiki_doc})
        return {
            "answer": result,
            "sources": [f"Wikipedia: {topic}"]
        }

    return {
        "answer": "Sorry, I couldn’t find any relevant information.",
        "sources": []
    }

def clear_memory():
    memory.clear()