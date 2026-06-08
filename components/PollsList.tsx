"use client";

import Poll from "./Poll";

export default function PollsList({ polls }: any) {
  if (!polls?.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-xl font-semibold">
        Polls
      </h2>

      {polls.map((poll: any) => (
        <Poll
          key={poll.id}
          poll={poll}
        />
      ))}
    </div>
  );
}