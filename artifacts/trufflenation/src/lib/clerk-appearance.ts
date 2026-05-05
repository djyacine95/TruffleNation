/** Shared Clerk theming to match TruffleNation (forest + parchment). */

export const clerkAppearance = {
  variables: {
    colorPrimary: "hsl(148 40% 16%)",
    colorText: "hsl(148 40% 12%)",
    colorTextSecondary: "hsl(148 20% 38%)",
    colorBackground: "hsl(40 33% 97%)",
    colorInputBackground: "hsl(40 33% 99%)",
    colorDanger: "hsl(0 72% 42%)",
    borderRadius: "0px",
    fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    card: "shadow-none border border-border rounded-none",
    headerTitle: "font-serif",
    socialButtonsBlockButton: "rounded-none",
    formButtonPrimary: "rounded-none",
    footerActionLink: "text-secondary",
  },
} as const;
