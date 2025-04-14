'use client';

import { useEffect, useState } from 'react';
import { FaTrash, FaHistory, FaBars } from 'react-icons/fa';

// Define types
type QuizItem = {
  question: string;
  options: string[];
  answer: string;
};

type QA = {
  question: string;
  answer: string;
};

export default function Home() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [checkedAnswers, setCheckedAnswers] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [chatHistory, setChatHistory] = useState<QA[]>([]);
  const [enableMemory, setEnableMemory] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('byteBuddyHistory');
    if (stored) setChatHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('byteBuddyHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const askQuestion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    resetQuizState();
    setAnswer('');
    setSources([]);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const res = await fetch(`${backendUrl}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setAnswer(data.answer);
      setSources(Array.isArray(data.sources) ? data.sources : []);
      if (enableMemory) setChatHistory((prev) => [...prev, { question, answer: data.answer }]);
    } catch (err) {
      console.error(err);
      setAnswer('Oops! Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async () => {
    if (!answer) return;
    setQuizLoading(true);
    resetQuizState();

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${backendUrl}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer }),
      });

      const data = await res.json();
      const quizData = Array.isArray(data.quiz)
        ? data.quiz
        : typeof data.quiz === 'string'
        ? JSON.parse(data.quiz)
        : [];

      setQuiz(quizData);
      setUserAnswers(Array(quizData.length).fill(null));
      setCheckedAnswers(Array(quizData.length).fill(false));
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setQuizLoading(false);
    }
  };

  const resetQuizState = () => {
    setQuiz([]);
    setUserAnswers([]);
    setCheckedAnswers([]);
    setShowScore(false);
  };

  const resetMemory = () => {
    setChatHistory([]);
    setQuestion('');
    setAnswer('');
    resetQuizState();
    setSources([]);
    localStorage.removeItem('byteBuddyHistory');
  };

  const handleCheckAnswer = (idx: number) => {
    const updated = [...checkedAnswers];
    updated[idx] = true;
    setCheckedAnswers(updated);
    if (updated.every(Boolean)) setShowScore(true);
  };

  const getSelectedLetter = (opt: string | null) =>
    opt?.trim().charAt(0).toUpperCase() || '';

  const score = quiz.reduce((acc, q, i) => {
    const selected = getSelectedLetter(userAnswers[i]);
    return acc + (selected === q.answer?.trim().toUpperCase() ? 1 : 0);
  }, 0);

  return (
    <div className="flex min-h-screen bg-neutral-100 dark:bg-black text-[var(--foreground)]">
      {sidebarOpen && (
        <aside className="w-80 bg-white dark:bg-neutral-900 border-r p-5 shadow-md fixed h-full z-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <FaHistory /> Chat History
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 dark:text-gray-300 hover:text-red-500"
              title="Close Sidebar"
            >
              ✖
            </button>
          </div>

          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={enableMemory}
              onChange={() => setEnableMemory((v) => !v)}
              className="accent-blue-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable Chat Memory</span>
          </label>

          <button
            onClick={resetMemory}
            className="flex items-center gap-2 justify-center mb-6 bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-90 text-white w-full px-4 py-2 rounded-md transition"
          >
            <FaTrash /> Reset Memory
          </button>

          {chatHistory.length === 0 ? (
            <p className="text-sm text-gray-500">No chat history yet.</p>
          ) : (
            <div className="overflow-y-auto max-h-[75vh] pr-2 space-y-4">
              {chatHistory.map((qa, i) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium mb-1">Q: {qa.question}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200">A: {qa.answer}</p>
                </div>
              ))}
            </div>
          )}
        </aside>
      )}

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-0'} p-6 flex flex-col items-center`}>
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="mb-4 self-start text-gray-600 dark:text-gray-300 hover:text-blue-600"
          >
            <FaBars className="inline mr-2" /> Chat History
          </button>
        )}

        <h1 className="text-4xl font-bold mb-6 text-center">Byte Buddy 🤖</h1>

<textarea
  className="w-full max-w-2xl p-4 border rounded-md bg-white dark:bg-neutral-900 text-black dark:text-white mb-4"
  rows={4}
  placeholder="Ask a question (e.g., What is a semaphore?)"
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
/>

<button
  onClick={askQuestion}
  disabled={loading}
  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md disabled:opacity-50 mb-8"
>
  {loading ? 'Thinking...' : 'Ask'}
</button>

{/* Answer display */}
{answer && (
  <div className="w-full max-w-2xl bg-gray-100 dark:bg-neutral-800 p-4 rounded-md shadow">
    <h2 className="font-semibold text-lg mb-2">Answer:</h2>
    <p className="text-base whitespace-pre-wrap mb-4">{answer}</p>

    {sources.length > 0 && (
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        <span className="font-semibold">Sources:</span>{' '}
        {sources.map((src, i) => (
          <span key={i} className="inline-block mx-1 px-2 py-1 bg-white/40 dark:bg-black/40 rounded">
            {src}
          </span>
        ))}
      </div>
    )}

    <button
      onClick={generateQuiz}
      disabled={quizLoading}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
    >
      {quizLoading ? 'Generating Quiz...' : 'Quiz Me'}
    </button>
  </div>
)}

{/* Quiz Display */}
{quiz.length > 0 && (
  <div className="w-full max-w-2xl mt-8 space-y-6">
    <h2 className="text-xl font-bold mb-2">Generated Quiz 📝</h2>

    {quiz.map((item, idx) => {
      const selected = userAnswers[idx];
      const isChecked = checkedAnswers[idx];
      const isCorrect =
        getSelectedLetter(selected) === item.answer?.trim().toUpperCase();

      return (
        <div key={idx} className="p-4 rounded-md border bg-white dark:bg-neutral-900">
          <p className="font-semibold mb-2">{idx + 1}. {item.question}</p>

          <ul className="space-y-2">
            {item.options.map((opt, i) => (
              <li key={i}>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q-${idx}`}
                    value={opt}
                    checked={selected === opt}
                    onChange={() => {
                      const updated = [...userAnswers];
                      updated[idx] = opt;
                      setUserAnswers(updated);
                    }}
                    className="accent-blue-600"
                  />
                  <span>{opt}</span>
                </label>
              </li>
            ))}
          </ul>

          <button
            disabled={!selected || isChecked}
            onClick={() => handleCheckAnswer(idx)}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Check My Answer
          </button>

          {isChecked && (
            <p className={`mt-3 text-sm font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect
                ? '✅ Correct!'
                : `❌ Incorrect. Correct answer: ${item.answer}`}
            </p>
          )}
        </div>
      );
    })}

    {showScore && (
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded text-center">
        <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
          🎉 You scored {score} out of {quiz.length}
        </p>
        <button
          onClick={generateQuiz}
          className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Retake Quiz
        </button>
      </div>
    )}
  </div>
)}

      </main>
    </div>
  );
}
