from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from langchain_openai import ChatOpenAI
from app.rag import get_answer, clear_memory
import json
import os

# ✅ Initialize app + rate limiter
app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# ✅ CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Exception handler for rate limit
@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"error": "Too many requests! Please wait a moment."},
    )

# ✅ Load OpenAI key from env
openai_key = os.getenv("OPENAI_API_KEY")
if not openai_key:
    raise EnvironmentError("❌ OPENAI_API_KEY is not set in environment")

llm = ChatOpenAI(temperature=0.7, openai_api_key=openai_key)

@app.get("/")
def root():
    return {"message": "✅ Byte Buddy backend is running."}

# ✅ RAG-based query
@app.post("/query")
@limiter.limit("10/minute")
async def query(request: Request):
    body = await request.json()
    question = body.get("question", "").strip()
    print("📥 Question:", question)

    if not question:
        return JSONResponse(status_code=400, content={"error": "Question is empty"})

    result = get_answer(question)
    print("💡 Answer:", result)
    return result

# ✅ Generate quiz
@app.post("/quiz")
@limiter.limit("5/minute")
async def generate_quiz(request: Request):
    body = await request.json()
    answer = body.get("answer", "")

    if not answer:
        return JSONResponse(status_code=400, content={"error": "Answer content is empty"})

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
        "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
        "answer": "C"
      }},
      ...
    ]
    Only return the JSON array. No extra commentary.
    """

    try:
        raw = llm.invoke(prompt)
        print("🧠 LLM Raw Output:", raw)

        json_string = raw.content if hasattr(raw, "content") else str(raw)
        parsed = json.loads(json_string)

        if not isinstance(parsed, list):
            raise ValueError("Quiz output is not a list")

        return {"quiz": parsed}
    except Exception as e:
        print("❌ Quiz generation error:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.post("/reset")
def reset_chat():
    clear_memory()
    return {"message": "🧹 Chat memory reset."}
