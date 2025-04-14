from langchain_community.document_loaders import PyPDFLoader, TextLoader
from pathlib import Path

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
