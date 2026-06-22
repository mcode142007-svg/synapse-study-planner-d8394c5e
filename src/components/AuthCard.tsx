import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Leaves } from "@/components/Leaves";

type Mode = "login" | "signup";

export function AuthCard({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function routeAfterAuth(userId: string) {
    const { data } = await supabase
      .from("users")
      .select("onboarding_complete")
      .eq("id", userId)
      .maybeSingle();
    navigate({ to: data?.onboarding_complete ? "/dashboard" : "/onboarding", replace: true });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setError("Check your email to confirm your account, then sign in.");
          return;
        }
        await routeAfterAuth(data.session.user.id);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await routeAfterAuth(data.session.user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error.message ?? "Google sign-in failed.");
      return;
    }
    if (result.redirected) return;
    const { data } = await supabase.auth.getUser();
    if (data.user) await routeAfterAuth(data.user.id);
  }

  const heading = mode === "login" ? "Welcome back" : "Begin your journey";
  const submitLabel = mode === "login" ? "Sign in" : "Create account";

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10">
      <Leaves />
      <div className="relative z-10 bg-white/75 dark:bg-white/10 backdrop-blur rounded-2xl shadow-md p-10 max-w-sm w-full border border-[#F7C8D3]/30">
        <h1 className="text-5xl font-semibold text-[#2D3A47] text-center">Synapse</h1>
        <p className="mt-1 text-center italic text-[#B46A72] text-base">
          Your intelligent study companion
        </p>
        <h2 className="mt-6 text-2xl font-semibold text-[#2D3A47]/90">{heading}</h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl py-4 px-4 text-base border border-[#F7C8D3] bg-white/80 w-full text-[#2D3A47] placeholder:text-[#6B7280] focus:outline-none focus:border-[#B46A72]"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl py-4 px-4 text-base border border-[#F7C8D3] bg-white/80 w-full text-[#2D3A47] placeholder:text-[#6B7280] focus:outline-none focus:border-[#B46A72]"
          />

          {error && (
            <p className="text-base italic text-[#B46A72]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#B46A72] text-[#FFF7E6] rounded-xl py-3 w-full font-serif font-semibold min-h-[44px] active:scale-95 transition-transform duration-75 disabled:opacity-60"
          >
            {loading ? "Please wait…" : submitLabel}
          </button>
        </form>

        <div className="relative my-4 text-center">
          <span className="italic text-base text-[#6B7280]">or</span>
        </div>

        <button
          onClick={handleGoogle}
          className="border border-[#B46A72] text-[#B46A72] rounded-xl py-4 w-full font-semibold min-h-[48px] active:scale-95 transition-transform duration-75 flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#B46A72" d="M21.35 11.1H12v2.92h5.35c-.23 1.5-1.7 4.4-5.35 4.4-3.22 0-5.85-2.67-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.77 1.45l2.57-2.48C16.86 3.99 14.65 3 12 3 6.98 3 3 6.98 3 12s3.98 9 9 9c5.2 0 8.65-3.65 8.65-8.78 0-.59-.07-1.04-.3-1.12Z"/></svg>
          Continue with Google
        </button>

        <p className="mt-5 text-center italic text-base text-[#B46A72]">
          {mode === "login" ? (
            <>New here? <Link to="/signup" className="underline">Create an account</Link></>
          ) : (
            <>Already have an account? <Link to="/login" className="underline">Sign in</Link></>
          )}
        </p>
      </div>
    </div>
  );
}