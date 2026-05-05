import { PageLayout } from "@/components/layout";
import { LearnSubnav } from "@/components/learn-subnav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { WorldTruffleMap } from "@/components/world-truffle-map";
import { TRUFFLE_SPECIES } from "@/data/truffle-regions";
import { Link } from "wouter";
import { BookOpen, Globe2, Leaf, ThermometerSun } from "lucide-react";

export default function TrufflesGuidePage() {
  return (
    <PageLayout>
      <LearnSubnav />
      <section className="bg-primary text-primary-foreground border-b border-primary-foreground/10">
        <div className="mx-auto max-w-4xl px-6 py-16 lg:py-20 lg:px-8">
          <Badge className="mb-4 rounded-none bg-secondary text-secondary-foreground border-0 uppercase tracking-widest text-xs">
            Field guide
          </Badge>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
            Understanding truffles
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/80 max-w-2xl leading-relaxed">
            A concise primer on species, seasons, and what to look for when you shop — whether you are cooking at home or sourcing for service.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Link href="/truffle-map">Open seasonal world map</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-none border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/truffles/videos">Watch video library</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-none border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link href="/shop">Browse the catalog</Link>
            </Button>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-6 py-16 lg:px-8 prose prose-neutral prose-lg dark:prose-invert prose-headings:font-serif prose-headings:text-primary prose-a:text-secondary prose-a:no-underline hover:prose-a:underline max-w-none">
        <h2>What is a truffle?</h2>
        <p>
          Truffles are underground fungi that form symbiotic relationships with tree roots. Unlike mushrooms that
          push up a cap, truffles mature entirely below the soil line and rely on animals (and historically, pigs and
          dogs) to spread spores. Their aroma is part reproductive strategy, part culinary jackpot: volatile compounds
          develop as they ripen and fade quickly after harvest.
        </p>

        <h2>Black, white, summer: how they differ</h2>
        <p>
          Chefs often speak in colors because it maps to aroma intensity and price tiers — but the real distinction is
          species and maturity. Black winter truffles (for example <em>Tuber melanosporum</em>) deliver deep, earthy,
          chocolate-garlic notes. White Alba truffles (<em>Tuber magnatum</em>) are more fleeting: garlicky, cheesy,
          and best shaved raw at the last second. Summer truffles (<em>Tuber aestivum</em>) are milder and more
          forgiving for heat, which makes them ideal for infusions and composed dishes.
        </p>

        <div className="not-prose grid gap-4 sm:grid-cols-2 my-10">
          {TRUFFLE_SPECIES.map((s) => (
            <Card key={s.id} className="rounded-none border-border">
              <CardHeader className="pb-2">
                <CardTitle className="font-serif text-lg">{s.commonName}</CardTitle>
                <p className="text-sm text-muted-foreground italic">{s.latin}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.id === "tuber-magnatum" &&
                    "Peak prestige; extremely short shelf life. Shave over fat, starch, or eggs — heat kills the top notes."}
                  {s.id === "tuber-melanosporum" &&
                    "The benchmark black winter truffle for risotto, roast birds, and compound butters when fully ripe."}
                  {s.id === "tuber-aestivum" &&
                    "Scorzone / summer black: nuttier and lighter; good for gentle warming, oils, and purées."}
                  {s.id === "tuber-uncinatum" &&
                    "Burgundy truffle: hazelnut and forest-floor aroma; bridges summer intensity with autumn depth."}
                  {s.id === "tuber-borchii" &&
                    "Bianchetto: assertive garlic note; smaller and earlier than magnatum; excellent value for pasta."}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2>Seasons and hemispheres</h2>
        <p>
          Northern Hemisphere winter truffles typically peak from late autumn through early spring. Australia, New
          Zealand, Chile, and South Africa harvest during local winter — which means global buyers can sometimes find
          fresh black winter truffles outside classic European months. Quality still depends on rainfall, soil, and
          post-harvest handling more than on the calendar alone.
        </p>

        <div className="not-prose overflow-x-auto my-8 border border-border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-foreground font-semibold">
              <tr>
                <th className="p-3 font-semibold">Focus</th>
                <th className="p-3 font-semibold">Northern Hemisphere</th>
                <th className="p-3 font-semibold">Southern Hemisphere</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-3">Black winter (melanosporum)</td>
                <td className="p-3 text-muted-foreground">Roughly Dec–Mar</td>
                <td className="p-3 text-muted-foreground">Roughly Jun–Aug</td>
              </tr>
              <tr>
                <td className="p-3">White Alba (magnatum)</td>
                <td className="p-3 text-muted-foreground">Roughly Oct–Dec</td>
                <td className="p-3 text-muted-foreground">Limited / emerging</td>
              </tr>
              <tr>
                <td className="p-3">Summer / Scorzone</td>
                <td className="p-3 text-muted-foreground">May–Aug</td>
                <td className="p-3 text-muted-foreground">Mirror by region</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Buying with confidence</h2>
        <p>
          Fresh truffles should feel firm, not spongy, and smell vivid — not like wet cardboard or ammonia. Small cuts
          or abrasions are normal; widespread soft spots are not. On TruffleNation, use origin and seller reputation
          the same way you would a wine list: ask questions, compare harvest dates, and favor listings with clear
          grading when available.
        </p>

        <h2>Storage and service</h2>
        <ul>
          <li>
            <strong>Short term:</strong> wrap in paper towel inside a sealed glass container; change the towel daily.
            Avoid rice myths — it dries the truffle unevenly and steals aroma.
          </li>
          <li>
            <strong>Temperature:</strong> cool fridge, not freezer, for fresh product unless you intentionally preserve
            for processing.
          </li>
          <li>
            <strong>White truffles:</strong> minimal heat; shave at the table. Black winter can tolerate gentle warmth
            in butter or cream if not overheated.
          </li>
        </ul>
      </article>

      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
            <div>
              <p className="text-secondary font-semibold text-sm uppercase tracking-widest mb-2">Geography</p>
              <h2 className="font-serif text-3xl font-bold text-primary">Where truffles meet the market</h2>
              <p className="mt-3 text-muted-foreground max-w-xl">
                Explore pins by species. For the full-screen experience, open the dedicated map page.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-none w-fit shrink-0">
              <Link href="/truffle-map">Full map</Link>
            </Button>
          </div>
          <WorldTruffleMap showIntro={false} />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-3 not-prose mb-12">
          {[
            { icon: Leaf, title: "Terroir matters", body: "Same species can express differently across oak, hazel, and pine hosts." },
            { icon: ThermometerSun, title: "Ripeness beats size", body: "A small ripe truffle often outperforms a large immature one on the plate." },
            { icon: BookOpen, title: "Read the listing", body: "Origin, harvest window, and handling notes tell you more than a photo alone." },
          ].map((item) => (
            <Card key={item.title} className="rounded-none border-border">
              <CardContent className="pt-6">
                <item.icon className="w-8 h-8 text-secondary mb-3" />
                <h3 className="font-serif font-semibold text-lg text-primary">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="font-serif text-3xl text-primary mb-6">Common questions</h2>
        <Accordion type="single" collapsible className="not-prose w-full border border-border rounded-none divide-y divide-border">
          <AccordionItem value="cultivated" className="border-0 px-4">
            <AccordionTrigger className="text-left font-medium">Are cultivated truffles “real”?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              Yes. Inoculated orchards produce the same species when host trees and soil conditions are right. Wild
              truffles can show more variability; cultivated lots can be more consistent — both belong in a serious
              market when honestly labeled.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="aroma" className="border-0 px-4">
            <AccordionTrigger className="text-left font-medium">Why did my truffle lose smell overnight?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              Aroma compounds are volatile and moisture-sensitive. Plastic wrap, warm counters, or dry refrigeration
              without breathable wrapping accelerates decline. Paper towel in a sealed jar in the coolest part of the
              fridge is the usual fix.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="oil" className="border-0 px-4">
            <AccordionTrigger className="text-left font-medium">Is truffle oil on menus the same thing?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              Most commercial truffle oils use synthetic aroma. They are not a substitute for fresh truffles and do not
              reflect what you will smell from a just-shaved magnatum or melanosporum.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="frozen" className="border-0 px-4">
            <AccordionTrigger className="text-left font-medium">Can I freeze fresh truffles?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
              Freezing changes texture and mutes top notes, but it can work for infusions and industrial prep. For raw
              service, fresh is the standard.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="not-prose mt-16 flex flex-wrap items-center gap-4 justify-between border border-border p-6 bg-primary text-primary-foreground">
          <div className="flex items-start gap-3">
            <Globe2 className="w-6 h-6 text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="font-serif font-semibold text-lg">See availability by region</p>
              <p className="text-sm text-primary-foreground/75 mt-1">
                Interactive map with species filters and harvest windows.
              </p>
            </div>
          </div>
          <Button asChild className="rounded-none bg-secondary text-secondary-foreground hover:bg-secondary/90 shrink-0">
            <Link href="/truffle-map">Seasonal map</Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  );
}
