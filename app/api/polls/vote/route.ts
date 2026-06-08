import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { optionId } = await req.json();

  const { data, error } = await supabase
    .from("poll_options")
    .select("votes")
    .eq("id", optionId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from("poll_options")
    .update({ votes: (data?.votes ?? 0) + 1 })
    .eq("id", optionId);

  return NextResponse.json({ success: true });
}