import { SignUp } from "@clerk/react";
import { PageLayout } from "@/components/layout";
import { useSearch } from "wouter";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AuthSignUpPage() {
  const search = useSearch();
  const redirect = getSafeRedirectPath(new URLSearchParams(search).get("redirect"), "/dashboard");
  const signInHref = `${basePath}/sign-in?redirect=${encodeURIComponent(redirect)}`;

  return (
    <PageLayout>
      <div className="border-b border-border bg-gradient-to-b from-card to-background">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16 lg:px-8 grid lg:grid-cols-[1fr_minmax(320px,440px)] gap-12 lg:gap-16 items-start">
          <div className="space-y-6 max-w-xl">
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest">Join</p>
            <h1 className="font-serif text-4xl font-bold text-primary tracking-tight">Create your TruffleNation account</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              List truffles, build a seller profile, or shop seasonal inventory with a single sign-on experience.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[440px] border border-border bg-card p-4 sm:p-6 shadow-sm rounded-none">
              <SignUp
                routing="path"
                path={`${basePath}/sign-up`}
                signInUrl={signInHref}
                fallbackRedirectUrl={redirect}
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
