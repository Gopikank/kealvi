import { supabase } from "./supabase";

export async function getPolls() {
  const { data, error } = await supabase
    .from("polls")
    .select(`
      *,
      poll_options (
        id,
        option_text,
        votes
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading polls:", error);
    return [];
  }

  return data;
}