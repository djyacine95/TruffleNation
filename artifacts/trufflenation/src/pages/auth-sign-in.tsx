import { SignIn } from "@clerk/react";
import { PageLayout } from "@/components/layout";
import { useSearch } from "wouter";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AuthSignInPage() {
  const search = useSearch();
  const redirect = getSafeRedirectPath(new URLSearchParams(search).get("redirect"), "/dashboard");
  const signUpHref = `${basePath}/sign-up?redirect=${encodeURIComponent(redirect)}`;

  return (
    <PageLayout>
      <div className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16 lg:px-8 grid lg:grid-cols-[1fr_minmax(320px,440px)] gap-12 lg:gap-16 items-start">
          <div className="space-y-6 max-w-xl">
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest">Account</p>
            <h1 className="font-serif text-4xl font-bold text-primary tracking-tight">Sign in to TruffleNation</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Access your cart, orders, seller dashboard, and seasonal buying tools. After signing in you will be
              returned to the page you were trying to open when possible.
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-5">
              <li>Secure authentication powered by Clerk</li>
              <li>Same account for buying and selling</li>
              <li>Development keys use test users from your Clerk dashboard</li>
            </ul>
          </div>
          <div className="flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[440px] border border-border bg-card p-4 sm:p-6 shadow-sm rounded-none">
              <SignIn
                routing="path"
                path={`${basePath}/sign-in`}
                signUpUrl={signUpHref}
                fallbackRedirectUrl={redirect}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
