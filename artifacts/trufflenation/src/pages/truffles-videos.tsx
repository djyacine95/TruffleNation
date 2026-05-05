import { PageLayout } from "@/components/layout";
import { LearnSubnav } from "@/components/learn-subnav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TRUFFLE_VIDEO_LINKS, TRUFFLE_YOUTUBE_FEATURED } from "@/data/truffle-videos";
import { Link } from "wouter";
import { ExternalLink, Film, Play } from "lucide-react";

function YoutubeEmbed({
  youtubeId,
  title,
}: {
  youtubeId: string;
  title: string;
}) {
  return (
    <div className="aspect-video w-full overflow-hidden border border-border bg-black shadow-sm rounded-none">
      <iframe
        title={title}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        className="h-full w-full"
      />
    </div>
  );
}

export default function TrufflesVideosPage() {
  return (
    <PageLayout>
      <LearnSubnav />
      <section className="bg-primary text-primary-foreground border-b border-primary-foreground/10">
        <div className="mx-auto max-w-6xl px-6 py-14 lg:py-16 lg:px-8">
          <Badge className="mb-4 rounded-none bg-secondary text-secondary-foreground border-0 uppercase tracking-widest text-xs">
            Watch & learn
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight max-w-3xl">
            Truffle video library
          </h1>
          <p className="mt-5 text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            Hand-picked explainers, field hunts, and cultural context. Embeds load only on this page; external picks
            open the publisher’s site in a new tab.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2">
              <Link href="/truffles">
                <Film className="w-4 h-4" />
                Field guide
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-none border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/truffle-map">Seasonal map</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-8 space-y-12">
        <div>
          <h2 className="font-serif text-2xl text-primary mb-2">Featured on YouTube</h2>
          <p className="text-muted-foreground text-sm max-w-2xl mb-8">
            Curated for education and atmosphere — not affiliated with TruffleNation; all rights belong to the listed
            channels.
          </p>
          <div className="grid gap-10 md:grid-cols-2">
            {TRUFFLE_YOUTUBE_FEATURED.map((video) => (
              <Card key={video.youtubeId} className="rounded-none border-border overflow-hidden">
                <YoutubeEmbed youtubeId={video.youtubeId} title={video.title} />
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge variant="outline" className="rounded-none text-[10px] uppercase tracking-wide">
                      {video.topic}
                    </Badge>
                    {video.durationApprox ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {video.durationApprox}
                      </span>
                    ) : null}
                  </div>
                  <CardTitle className="font-serif text-lg leading-snug">{video.title}</CardTitle>
                  <CardDescription className="text-xs font-medium text-secondary">{video.channel}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed pt-0">
                  {video.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-serif text-2xl text-primary mb-2">Official & long-form</h2>
          <p className="text-muted-foreground text-sm max-w-2xl mb-8">
            High-production pieces and heritage documentation — watch on the publisher’s player.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRUFFLE_VIDEO_LINKS.map((item) => (
              <Card key={item.href} className="rounded-none border-border flex flex-col">
                <CardHeader className="pb-2">
                  <Badge variant="outline" className="w-fit rounded-none text-[10px] uppercase tracking-wide mb-2">
                    {item.topic}
                  </Badge>
                  <CardTitle className="font-serif text-base leading-snug">{item.title}</CardTitle>
                  <CardDescription className="text-xs font-medium text-secondary">{item.source}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {item.description}
                </CardContent>
                <CardContent className="pt-0">
                  <Button asChild variant="outline" size="sm" className="rounded-none w-full gap-2">
                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                      Watch on publisher site
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
