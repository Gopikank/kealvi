"use client";

import { useState } from "react";

export default function Poll({ poll }: any) {
  const [options, setOptions] = useState(
    poll.poll_options || []
  );

  async function vote(optionId: string) {
    try {
      const res = await fetch("/api/polls/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ optionId }),
      });

      if (!res.ok) {
        console.error("Vote failed");
        return;
      }

      setOptions((prev: any[]) =>
        prev.map((opt) =>
          opt.id === optionId
            ? { ...opt, votes: opt.votes + 1 }
            : opt
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mb-4 rounded-xl border p-5">
      <h3 className="mb-4 text-lg font-semibold">
        {poll.question}
      </h3>

      <div className="space-y-2">
        {options.map((option: any) => (
          <button
            key={option.id}
            onClick={() => vote(option.id)}
            className="w-full rounded border p-3 text-left hover:bg-gray-100"
          >
            {option.option_text}

            <span className="float-right">
              {option.votes}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}