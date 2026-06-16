import { supabase } from "@/integrations/supabase/client";

/**
 * Delete all downstream onboarding data for a user.
 * Used when an earlier step is edited and its dependents become stale.
 */
export async function clearGoalsAndDownstream(userId: string) {
  await Promise.all([
    supabase.from("syllabus").delete().eq("user_id", userId),
    supabase.from("subjects").delete().eq("user_id", userId),
  ]);
  // Delete goals after children to avoid FK issues
  await supabase.from("goals").delete().eq("user_id", userId);
}