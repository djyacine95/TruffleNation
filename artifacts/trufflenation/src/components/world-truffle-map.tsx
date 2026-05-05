import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { cn } from "@/lib/utils";
import {
  TRUFFLE_REGIONS,
  TRUFFLE_SPECIES,
  type TruffleRegion,
  type TruffleSpeciesId,
} from "@/data/truffle-regions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import "leaflet/dist/leaflet.css";

const MAP_TILE = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

const MAP_H_CLASS = "min-h-[320px] h-[48vh] md:h-[56vh] max-h-[640px]";

function regionMatchesFilter(region: TruffleRegion, filter: TruffleSpeciesId | "all") {
  if (filter === "all") return true;
  return region.species.includes(filter);
}

function MapViewController({
  visible,
  activeId,
}: {
  visible: TruffleRegion[];
  activeId: string | null;
}) {
  const map = useMap();
  const visibleKey = visible.map((v) => v.id).sort().join(",");

  useEffect(() => {
    const active = activeId ? TRUFFLE_REGIONS.find((r) => r.id === activeId) : null;
    if (active) {
      map.flyTo([active.lat, active.lng], Math.max(map.getZoom(), 5), { duration: 0.45 });
      return;
    }
    if (visible.length === 0) return;
    const corners = visible.map((v) => [v.lat, v.lng] as L.LatLngTuple);
    const b = L.latLngBounds(corners);
    map.fitBounds(b, { padding: [52, 52], maxZoom: 5, animate: true });
  }, [map, activeId, visibleKey]);

  return null;
}

type WorldTruffleMapProps = {
  className?: string;
  showIntro?: boolean;
};

export function WorldTruffleMap({ className, showIntro = true }: WorldTruffleMapProps) {
  const [filter, setFilter] = useState<TruffleSpeciesId | "all">("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  const visible = useMemo(
    () => TRUFFLE_REGIONS.filter((r) => regionMatchesFilter(r, filter)),
    [filter],
  );

  const scrollWheelZoom = showIntro;

  const filterToolbar = (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant={filter === "all" ? "default" : "outline"}
        className="rounded-none"
        onClick={() => {
          setFilter("all");
          setActiveId(null);
        }}
      >
        {showIntro ? "All regions" : "All"}
      </Button>
      {TRUFFLE_SPECIES.map((s) => (
        <Button
          key={s.id}
          type="button"
          size="sm"
          variant={filter === s.id ? "default" : "outline"}
          className="rounded-none text-xs"
          onClick={() => {
            setFilter(s.id);
            setActiveId(null);
          }}
        >
          {s.commonName}
        </Button>
      ))}
    </div>
  );

  return (
    <div className={cn("space-y-6", className)}>
      {showIntro ? (
        <Card className="rounded-none border-border">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-2xl">Filter by species</CardTitle>
            <CardDescription>
              OpenStreetMap base with pins at approximate regional centers. Seasons are indicative — confirm with
              sellers.
            </CardDescription>
          </CardHeader>
          <CardContent>{filterToolbar}</CardContent>
        </Card>
      ) : (
        filterToolbar
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div
          className={cn(
            "relative overflow-hidden rounded-none border border-border bg-muted/30 shadow-sm",
            MAP_H_CLASS,
            "w-full",
          )}
        >
          {!mapReady ? (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-card">
              Loading map…
            </div>
          ) : (
            <MapContainer
              center={[22, 12]}
              zoom={2}
              minZoom={2}
              maxBounds={[
                [-85, -200],
                [85, 200],
              ]}
              maxBoundsViscosity={0.85}
              className="z-0 h-full w-full rounded-none"
              style={{ background: "hsl(var(--muted) / 0.5)" }}
              scrollWheelZoom={scrollWheelZoom}
              worldCopyJump
            >
              <TileLayer attribution={MAP_ATTRIBUTION} url={MAP_TILE} />
              <MapViewController visible={visible} activeId={activeId} />
              {visible.map((region) => {
                const isActive = activeId === region.id;
                return (
                  <CircleMarker
                    key={region.id}
                    center={[region.lat, region.lng]}
                    radius={isActive ? 13 : 9}
                    pathOptions={{
                      color: "hsl(148 40% 16%)",
                      weight: 2,
                      fillColor: isActive ? "hsl(35 80% 50%)" : "hsl(148 40% 28%)",
                      fillOpacity: 0.92,
                    }}
                    eventHandlers={{
                      click: () => setActiveId(isActive ? null : region.id),
                    }}
                  >
                    <Popup className="rounded-none">
                      <div className="min-w-[200px] max-w-[260px] text-foreground">
                        <p className="font-serif font-semibold text-sm leading-snug">
                          {region.name}
                          <span className="text-muted-foreground font-sans font-normal"> — {region.country}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{region.blurb}</p>
                        <p className="text-xs text-secondary font-medium mt-2">{region.peakSeason}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          )}
          <p className="pointer-events-none absolute bottom-2 left-3 right-3 z-[500] text-[11px] text-muted-foreground drop-shadow-sm bg-background/90 px-2 py-1 border border-border/60 w-fit max-w-[calc(100%-1.5rem)]">
            {scrollWheelZoom ? "Tip: scroll to zoom, drag to pan." : "Embedded map — open full page for scroll zoom."}
          </p>
        </div>

        <Card className="rounded-none border-border h-fit xl:sticky xl:top-24">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-xl">Regions</CardTitle>
            <CardDescription>
              {visible.length} location{visible.length !== 1 ? "s" : ""} match
              {filter === "all" ? " all species" : ` ${TRUFFLE_SPECIES.find((s) => s.id === filter)?.commonName ?? ""}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-[min(55vh,480px)] overflow-y-auto space-y-3 pr-1">
            {visible.map((region) => {
              const selected = activeId === region.id;
              return (
                <button
                  key={region.id}
                  type="button"
                  onMouseEnter={() => setActiveId(region.id)}
                  onClick={() => setActiveId(region.id)}
                  className={cn(
                    "w-full text-left border p-3 transition-colors rounded-none",
                    selected ? "border-secondary bg-secondary/10" : "border-border hover:border-primary/30",
                  )}
                >
                  <p className="font-semibold text-sm text-foreground">
                    {region.name}
                    <span className="text-muted-foreground font-normal"> — {region.country}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{region.blurb}</p>
                  <p className="text-xs text-secondary font-medium mt-2">{region.peakSeason}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {region.species.map((sid) => (
                      <Badge key={sid} variant="outline" className="rounded-none text-[10px] font-normal">
                        {TRUFFLE_SPECIES.find((s) => s.id === sid)?.commonName ?? sid}
                      </Badge>
                    ))}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
