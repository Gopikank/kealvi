"use client";
import { useState, useEffect } from "react";
import { getVoterId } from "@/lib/voter";

type Question = {
  id: string;
  body: string;
  author: string | null;
  votes: number;
};

export default function QuestionsList({
  initialQuestions,
  initialHasMore,
}: {
  initialQuestions: Question[];
  initialHasMore: boolean;
}) {
    const [questions, setQuestions] = useState(initialQuestions);
    const [draft, setDraft] = useState("");
    const [query, setQuery] = useState("");
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);

    const [answer, setAnswer] = useState("");
    const [answerLoading, setAnswerLoading] = useState(false);

    const [hydrated, setHydrated] = useState(false);
 
  useEffect(() => setHydrated(true), []);

  // Debounced search: wait 300ms after typing stops; each keystroke cancels
  // the previous timer, so "deploying" fires one request, not nine.
  useEffect(() => {
    const id = setTimeout(async () => {
      const url = query
        ? `/api/questions?q=${encodeURIComponent(query)}`
        : `/api/questions`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.questions);
      setHasMore(data.hasMore);
    }, 300);

    return () => clearTimeout(id); // cancel the pending timer on each keystroke
  }, [query]);

 async function submit() {
  if (!draft.trim()) return;

  setAnswerLoading(true);

  try {
    // 1. Save question to Supabase
    const saveRes = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: draft,
      }),
    });

    const created = await saveRes.json();

    // 2. Show the new question immediately on the page
    setQuestions((qs) => [
      {
        ...created,
        votes: 0,
      },
      ...qs,
    ]);

    // 3. Get AI answer from Groq
    const aiRes = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: draft,
      }),
    });

    const aiData = await aiRes.json();

    // 4. Display answer
    setAnswer(aiData.answer);

    // 5. Clear input box
    setDraft("");
  } catch (error) {
    console.error(error);
    setAnswer("Failed to generate answer.");
  }

  setAnswerLoading(false);
}

  async function upvote(id: string) {
  // Increase vote and sort immediately
  setQuestions((qs) =>
    [...qs]
      .map((q) =>
        q.id === id
          ? { ...q, votes: q.votes + 1 }
          : q
      )
      .sort((a, b) => b.votes - a.votes)
  );

  const res = await fetch(`/api/questions/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      voterId: getVoterId(),
    }),
  });

  // Roll back if vote fails
  if (!res.ok) {
    setQuestions((qs) =>
      [...qs]
        .map((q) =>
          q.id === id
            ? { ...q, votes: q.votes - 1 }
            : q
        )
        .sort((a, b) => b.votes - a.votes)
    );
  }
}

  async function loadMore() {
    setLoading(true);
    const res = await fetch(`/api/questions?offset=${questions.length}`);
    const data = await res.json();
    setQuestions((qs) => [...qs, ...data.questions]);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      {/* Ask box */}
      <div className="rounded-2xl border bg-surface p-4 shadow-sm">
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ask a question…"
            className="flex-1 rounded-xl border bg-background px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand"
          />
          <button
            onClick={submit}
            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-strong"
          >
            Ask
          </button>
        </div>
      </div>

      {answerLoading && (
        <div className="rounded-xl border p-4">
          Generating answer...
        </div>
      )}

      {answer && (
        <div className="rounded-xl border p-4">
          <h3 className="font-semibold mb-2">
            AI Answer
          </h3>
          <p>{answer}</p>
        </div>
      )}

      

      {/* Search + hydration status */}
      <div className="flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search questions…"
          className="w-full flex-1 rounded-xl border bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted focus:border-brand"
        />
        <span className="shrink-0 text-xs text-muted">
          {hydrated ? "Interactive ✓" : "Loading interactivity…"}
        </span>
      </div>

      {/* Questions */}
      <ul className="space-y-3">
  {[...questions]
    .sort((a, b) => b.votes - a.votes)
    .map((q) => (
          <li
            key={q.id}
            className="flex items-start gap-3 rounded-2xl border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <button
              onClick={() => upvote(q.id)}
              className="flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3.5 py-2 text-brand transition-colors hover:border-brand hover:bg-brand-soft"
            >
              <span className="text-xs leading-none">▲</span>
              <span className="text-sm font-semibold leading-none tabular-nums">
                {q.votes}
              </span>
            </button>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="leading-snug">{q.body}</p>
              {q.author && (
                <p className="mt-1.5 text-xs text-muted">{q.author}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {questions.length === 0 && (
        <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted">
          No questions yet — be the first to ask.
        </p>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-xl border bg-surface px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}