"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const BACKEND = "https://apexsim-backend.vercel.app/api";

// After Clerk resolves the Facebook / Apple OAuth, this page bridges the
// Clerk session to the app's own backend JWT (stored in localStorage).
export default function SSOCompletePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      router.replace("/login?error=Authentication+failed");
      return;
    }

    const email = user.emailAddresses[0]?.emailAddress ?? "";
    const name = user.fullName || user.firstName || email;
    const ext = user.externalAccounts?.[0];
    // Clerk returns provider as e.g. "oauth_facebook" — strip the prefix
    const provider = ext?.provider?.replace(/^oauth_/, "") ?? "clerk";
    const socialId = ext?.providerUserId ?? user.id;

    fetch(`${BACKEND}/auth/social-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, name, email, socialId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          router.replace("/dashboard/market");
        } else {
          router.replace(
            `/login?error=${encodeURIComponent(data.message || "Authentication failed")}`
          );
        }
      })
      .catch(() => router.replace("/login?error=Authentication+failed"));
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div className="min-h-screen bg-[#181818] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#0055FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-inter">Completing sign in…</p>
      </div>
    </div>
  );
}
