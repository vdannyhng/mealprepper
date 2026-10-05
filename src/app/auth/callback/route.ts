import { NextResponse, type NextRequest } from "next/server";
import { createClient, type EmailOtpType } from "@/lib/supabase/server";
import { safeRedirectPath } from "@/lib/validation/auth";

/**
 * Landing point for email confirmation, magic links and OAuth.
 * Supports the PKCE "code" flow and the "token_hash" flow of custom email templates.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeRedirectPath(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let ok = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  }

  return NextResponse.redirect(new URL(ok ? next : "/login?error=auth", origin));
}
