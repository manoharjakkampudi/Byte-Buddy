# 🤖 Byte Buddy

Byte Buddy is an AI-powered learning assistant designed to help users understand computer science concepts through question-answering, contextual search, and personalized quizzes.

Built using:
- **FastAPI** + **LangChain** + **FAISS** for backend
- **Next.js (React)** with Tailwind CSS for frontend
- **OpenAI GPT models** for language tasks

---

## 🚀 Features

- 🔍 **Ask questions** with context-aware RAG-based answers (PDFs or Wikipedia fallback)
- 📚 **Upload PDFs or `.md` files** to customize your AI knowledge base
- 🧠 **Conversational memory** and optional history tracking
- 📝 **Quiz Me**: Generates multiple-choice quizzes based on explanations
- 💡 **Source-aware answers** (if documents support metadata)
- 🧹 Reset chat memory at any time

---

## 🗂 Project Structure

```
byte-buddy/
│
├── backend/
│ ├── main.py # FastAPI app with endpoints for query, quiz, and reset
│ ├── rag.py # Core RAG logic with vector DB + Wikipedia fallback
│ ├── utils.py # PDF/MD loader
│
├── frontend/
│ ├── layout.tsx # Root layout using Next.js and Geist fonts
│ ├── page.tsx # Main page logic: chat, answer, quiz, history
│ ├── globals.css # Custom styling + Tailwind themes
│
├── data/ # Local documents (.pdf, .md) for RAG
├── .env # OpenAI API key and backend settings
└── requirements.txt # Python dependencies
```


---

## ⚙️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/byte-buddy.git
cd byte-buddy
```
###2. Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows

pip install -r requirements.txt
```
Create a .env file in backend/:
```bash
OPENAI_API_KEY=your_openai_api_key
```
Start the backend:

```bash
uvicorn main:app --reload
```
### 3. Frontend Setup (Next.js + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
Set the following in your .env.local:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

💡 **Usage Flow**

1.Ask a question (e.g., What is a semaphore?)

2.The backend responds with a RAG-based or Wikipedia-backed answer.

3.Click "Quiz Me" to get MCQs based on the explanation.

4.Select answers and check correctness.

5.View score and optionally retake quiz.

📦 **API Endpoints (Backend)**
| Method | Endpoint | Description                         |
| ------ | -------- | ----------------------------------- |
| `GET`  | `/`      | Health check                        |
| `POST` | `/query` | Ask a question                      |
| `POST` | `/quiz`  | Generate quiz from answer           |
| `POST` | `/reset` | Reset memory and conversation state |


🧠 **Tech Stack**
 --FastAPI + LangChain + FAISS

 --OpenAI Chat Models

 --Tailwind CSS + Next.js (App Router)

 --Rate limiting with slowapi

 --PDF/Markdown ingestion via langchain_community

🙌 **Contributions**


Feel free to fork, extend agents, integrate additional models, or add UI enhancements.

