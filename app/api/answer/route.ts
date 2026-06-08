import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  const { question } = await req.json();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: "You are a helpful Q&A assistant.",
      },
      {
        role: "user",
        content: question,
      },
    ],
  });

  return NextResponse.json({
    answer: completion.choices[0].message.content,
  });
}