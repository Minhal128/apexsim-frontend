"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

const BACKEND = "https://apexsim-backend.vercel.app/api";

const Spinner = () => (
  <div className="min-h-screen bg-[#181818] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm font-inter">Signing you in…</p>
    </div>
  </div>
);

// Handles Clerk's OAuth callback (Facebook / Apple via Clerk)
// Clerk will then redirect to /sso-callback/complete
function ClerkCallbackHandler() {
  return (
    <>
      <AuthenticateWithRedirectCallback />
      <Spinner />
    </>
  );
}

// Handles legacy flows: Google implicit (hash token) and server-side token
function LegacySSOHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      router.push(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    // ── Google implicit flow: access_token is in the URL hash ──────────────
    const hash = typeof window !== "undefined" ? window.location.hash.substring(1) : "";
    const hashParams = new URLSearchParams(hash);
    const googleAccessToken = hashParams.get("access_token");

    if (googleAccessToken) {
      fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      })
        .then((r) => r.json())
        .then(async (profile) => {
          const res = await fetch(`${BACKEND}/auth/social-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: "google",
              name: profile.name || profile.email,
              email: profile.email,
              socialId: profile.id,
            }),
          });
          const data = await res.json();
          if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            router.push("/dashboard/market");
          } else {
            router.push(`/login?error=${encodeURIComponent(data.message || "Google login failed")}`);
          }
        })
        .catch(() => router.push("/login?error=Google+login+failed"));
      return;
    }

    // ── Legacy fallback: token passed as query param (server-side flow) ────
    const token = searchParams.get("token");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const id = searchParams.get("id");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ id, name, email }));
      router.push("/dashboard/market");
    } else {
      router.push("/login?error=Authentication+failed");
    }
  }, [router, searchParams]);

  return <Spinner />;
}

function SSOCallbackInner() {
  const searchParams = useSearchParams();

  // Detect Clerk OAuth callback by its query params
  const isClerkCallback =
    searchParams.has("__clerk_status") ||
    searchParams.has("__clerk_db_jwt") ||
    searchParams.has("__clerk_handshake");

  if (isClerkCallback) {
    return <ClerkCallbackHandler />;
  }

  return <LegacySSOHandler />;
}

export default function SSOCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#181818] flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SSOCallbackInner />
    </Suspense>
  );
}


