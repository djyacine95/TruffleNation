/** Curated educational picks; YouTube IDs verified via oEmbed at build time of this list. */

export type TruffleYoutubeVideo = {
  kind: "youtube";
  youtubeId: string;
  title: string;
  channel: string;
  description: string;
  topic: string;
  durationApprox?: string;
};

export type TruffleExternalVideo = {
  kind: "external";
  href: string;
  title: string;
  source: string;
  description: string;
  topic: string;
};

export const TRUFFLE_YOUTUBE_FEATURED: TruffleYoutubeVideo[] = [
  {
    kind: "youtube",
    youtubeId: "wIRIZzTWGuU",
    title: "Truffle hunting in Tuscany — from forest to plate",
    channel: "Nicki Positano",
    topic: "Hunt & cook",
    durationApprox: "26 min",
    description:
      "A day in the field with trained dogs, then tasting how fresh truffles meet pasta and butter in a regional kitchen.",
  },
  {
    kind: "youtube",
    youtubeId: "wRMb5eimStw",
    title: "Oregon truffle hunting with happy dogs",
    channel: "The King's Bolete",
    topic: "Pacific Northwest",
    durationApprox: "12 min",
    description:
      "Wild harvest culture in the Willamette Valley: dogs, duff, and why gentle extraction matters for aroma.",
  },
  {
    kind: "youtube",
    youtubeId: "zJCAje389Es",
    title: "Truffle hunting dogs in Oregon",
    channel: "Sabrina Guitart - Gitane Films",
    topic: "Dogs & training",
    durationApprox: "10 min",
    description:
      "Short documentary view on how handlers work with dogs to locate ripe truffles under Douglas fir.",
  },
  {
    kind: "youtube",
    youtubeId: "KFYhrc0AnVw",
    title: "The Truffle Hunters — official trailer",
    channel: "Sony Pictures Classics",
    topic: "Culture & craft",
    durationApprox: "2 min",
    description:
      "A cinematic look at Piedmont’s aging foragers, their dogs, and the fragile tradition of Alba’s white truffle.",
  },
];

export const TRUFFLE_VIDEO_LINKS: TruffleExternalVideo[] = [
  {
    kind: "external",
    href: "https://www.pbs.org/wnet/nature/truffles-are-hiding-a-dirty-little-secret/32479/",
    title: "Truffles are hiding a dirty little secret",
    source: "PBS Nature · Untold Earth",
    topic: "Ecology",
    description:
      "How truffles use aroma to recruit forest mammals — and why that matters for ecosystems beyond the plate.",
  },
  {
    kind: "external",
    href: "https://ich.unesco.org/en/video/57854",
    title: "Truffle hunting and extraction in Italy",
    source: "UNESCO Intangible Heritage",
    topic: "Heritage",
    description:
      "Official perspective on traditional knowledge, seasonal rhythms, and stewardship of truffle landscapes.",
  },
  {
    kind: "external",
    href: "https://www.ted.com/talks/carolyn_beans_what_are_truffles_and_why_are_they_so_expensive",
    title: "What are truffles, and why are they so expensive?",
    source: "TED · Carolyn Beans",
    topic: "Economics & biology",
    description:
      "A tight explainer on rarity, cultivation limits, climate pressure, and why demand outruns supply.",
  },
];
