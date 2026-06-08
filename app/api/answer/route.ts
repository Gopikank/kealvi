import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question?.trim()) {
      return NextResponse.json(
        {
          answer: "Please enter a question.",
        },
        { status: 200 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          answer:
            "AI service is not configured. GROQ_API_KEY is missing.",
        },
        { status: 200 }
      );
    }

    const completion = await groq.chat.completions.create({
     model: "llama-3.1-8b-instant",
      max_tokens: 300,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful Q&A assistant. Give clear and concise answers.",
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    const answer =
      completion.choices?.[0]?.message?.content ||
      "No answer generated.";

    return NextResponse.json({
      answer,
    });
  } catch (error: any) {
    console.error("Groq Error:", error);

    let message = "AI service is currently unavailable.";

    if (
      error?.message?.includes("organization_restricted")
    ) {
      message =
        "Groq account is restricted. Please generate a new API key or use another AI provider.";
    }

    return NextResponse.json(
      {
        answer: message,
      },
      { status: 200 }
    );
  }
}