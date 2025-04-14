from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from langchain_openai import ChatOpenAI
from app.rag import get_answer, clear_memory
import json
import os

# ✅ Step 1: Init FastAPI app
app = FastAPI()

# ✅ Step 2: Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In prod, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Step 3: Setup LLM for quiz generation (with key passed directly)
llm = ChatOpenAI(
    temperature=0.7,
    openai_api_key=os.getenv("OPENAI_API_KEY")
)
# ✅ Step 4: Health check
@app.get("/")
def root():
    return {"message": "Tutor backend is running."}

# ✅ Step 5: Handle question → answer using RAG
@app.post("/query")
async def query(request: Request):
    body = await request.json()
    question = body.get("question", "")
    print("✅ Received question:", question)

    result = get_answer(question)
    print("✅ Answer:", result)
    return result

# ✅ Step 6: Generate quiz from answer text
@app.post("/quiz")
async def generate_quiz(request: Request):
    body = await request.json()
    answer = body.get("answer", "")

    prompt = f"""
    Based on the explanation below, generate 3 multiple-choice questions.

    Explanation:
    {answer}

    Each question must have:
    - A clear question
    - 4 answer options (A–D)
    - A correct answer clearly marked

    Format as strict JSON:
    [
      {{
        "question": "What is a semaphore?",
        "options": ["A", "B", "C", "D"],
        "answer": "C"
      }},
      ...
    ]
    Only return the JSON array. No extra text.
    """

    try:
        raw = llm.invoke(prompt)
        print("🧠 LLM Raw Output:", raw)

        # ✅ Fix: extract actual string from AIMessage
        json_string = raw.content if hasattr(raw, "content") else str(raw)
        parsed = json.loads(json_string)

        return {"quiz": parsed}
    except Exception as e:
        print("❌ Quiz generation error:", e)
        return {"error": str(e)}

@app.post("/reset")
def reset_chat():
    clear_memory()
    return {"message": "Chat memory reset."}
