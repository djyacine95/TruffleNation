/** Curated for educational display — seasons vary by microclimate and year. */

export type TruffleSpeciesId =
  | "tuber-melanosporum"
  | "tuber-magnatum"
  | "tuber-aestivum"
  | "tuber-borchii"
  | "tuber-uncinatum";

export type TruffleRegion = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  species: TruffleSpeciesId[];
  peakSeason: string;
  /** Short note for map tooltip / list */
  blurb: string;
};

export const TRUFFLE_SPECIES: {
  id: TruffleSpeciesId;
  commonName: string;
  latin: string;
}[] = [
  {
    id: "tuber-melanosporum",
    commonName: "Black winter (Périgord)",
    latin: "Tuber melanosporum",
  },
  {
    id: "tuber-magnatum",
    commonName: "White Alba",
    latin: "Tuber magnatum pico",
  },
  {
    id: "tuber-aestivum",
    commonName: "Black summer / Scorzone",
    latin: "Tuber aestivum",
  },
  {
    id: "tuber-uncinatum",
    commonName: "Burgundy",
    latin: "Tuber uncinatum",
  },
  {
    id: "tuber-borchii",
    commonName: "Bianchetto",
    latin: "Tuber borchii",
  },
];

export const TRUFFLE_REGIONS: TruffleRegion[] = [
  {
    id: "piedmont",
    name: "Piedmont & Langhe",
    country: "Italy",
    lat: 44.7,
    lng: 8.1,
    species: ["tuber-melanosporum", "tuber-magnatum", "tuber-aestivum"],
    peakSeason: "Oct–Jan (white); Nov–Mar (black)",
    blurb: "Historic heartland for Alba white and fine black winter truffles.",
  },
  {
    id: "perigord",
    name: "Périgord & Southwest",
    country: "France",
    lat: 45.1,
    lng: 0.7,
    species: ["tuber-melanosporum", "tuber-aestivum", "tuber-uncinatum"],
    peakSeason: "Dec–Mar (winter black); May–Aug (summer)",
    blurb: "Namesake region for Périgord black; strong summer truffle trade.",
  },
  {
    id: "provence",
    name: "Provence",
    country: "France",
    lat: 43.9,
    lng: 6.2,
    species: ["tuber-melanosporum", "tuber-aestivum"],
    peakSeason: "Nov–Mar / summer peaks",
    blurb: "Wild and cultivated supply; markets in Carpentras and beyond.",
  },
  {
    id: "istria",
    name: "Istria",
    country: "Croatia / Slovenia / Italy",
    lat: 45.2,
    lng: 13.6,
    species: ["tuber-magnatum", "tuber-melanosporum", "tuber-aestivum", "tuber-borchii"],
    peakSeason: "Sep–Jan",
    blurb: "Growing global reputation for whites and blacks along the Adriatic.",
  },
  {
    id: "spain-aragon",
    name: "Teruel & Aragón",
    country: "Spain",
    lat: 40.35,
    lng: -1.1,
    species: ["tuber-melanosporum", "tuber-aestivum"],
    peakSeason: "Dec–Mar",
    blurb: "Major European producer of black winter truffles from orchards.",
  },
  {
    id: "oregon",
    name: "Willamette Valley",
    country: "USA (Oregon)",
    lat: 44.05,
    lng: -123.05,
    species: ["tuber-melanosporum", "tuber-uncinatum"],
    peakSeason: "Dec–Feb",
    blurb: "Pacific Northwest orchards and wild patches; winter market overlap with Europe.",
  },
  {
    id: "washington",
    name: "Inland Northwest",
    country: "USA (Washington / Idaho)",
    lat: 47.5,
    lng: -117.4,
    species: ["tuber-melanosporum"],
    peakSeason: "Dec–Feb",
    blurb: "Emerging orchard production in similar climate bands to Oregon.",
  },
  {
    id: "tasmania",
    name: "Tasmania",
    country: "Australia",
    lat: -42.9,
    lng: 147.3,
    species: ["tuber-melanosporum", "tuber-uncinatum"],
    peakSeason: "Jun–Aug (Southern winter)",
    blurb: "Southern-hemisphere winter harvest offsets Northern supply gaps.",
  },
  {
    id: "wa-australia",
    name: "Manjimup & SW",
    country: "Australia (Western)",
    lat: -34.25,
    lng: 116.15,
    species: ["tuber-melanosporum"],
    peakSeason: "Jun–Aug",
    blurb: "Large-scale inoculated orchards; export-grade blacks.",
  },
  {
    id: "nz",
    name: "North Island",
    country: "New Zealand",
    lat: -38.0,
    lng: 175.3,
    species: ["tuber-melanosporum", "tuber-aestivum"],
    peakSeason: "Jun–Aug",
    blurb: "Young industry with counter-seasonal harvest windows.",
  },
  {
    id: "romania",
    name: "Transylvania & hills",
    country: "Romania",
    lat: 46.0,
    lng: 25.0,
    species: ["tuber-melanosporum", "tuber-aestivum", "tuber-uncinatum"],
    peakSeason: "Nov–Mar",
    blurb: "Wild and semi-wild harvests; diverse ecotypes.",
  },
  {
    id: "hungary",
    name: "Northern & central",
    country: "Hungary",
    lat: 47.5,
    lng: 19.05,
    species: ["tuber-melanosporum", "tuber-aestivum", "tuber-uncinatum"],
    peakSeason: "Nov–Mar",
    blurb: "Oak forests; export and domestic gourmet markets.",
  },
  {
    id: "bulgaria",
    name: "Balkan forests",
    country: "Bulgaria",
    lat: 42.7,
    lng: 25.5,
    species: ["tuber-melanosporum", "tuber-aestivum"],
    peakSeason: "Dec–Mar",
    blurb: "Traditional foraging regions expanding with cultivation.",
  },
  {
    id: "uk",
    name: "Southern England",
    country: "United Kingdom",
    lat: 51.05,
    lng: -2.2,
    species: ["tuber-aestivum", "tuber-uncinatum"],
    peakSeason: "Jun–Aug (summer); autumn Burgundy",
    blurb: "Smaller volumes; growing interest in native and cultivated summer types.",
  },
  {
    id: "chile",
    name: "Central Chile",
    country: "Chile",
    lat: -36.8,
    lng: -72.1,
    species: ["tuber-melanosporum"],
    peakSeason: "Jun–Aug",
    blurb: "Southern-hemisphere orchards in Mediterranean climate valleys.",
  },
  {
    id: "south-africa",
    name: "Western Cape",
    country: "South Africa",
    lat: -33.9,
    lng: 18.5,
    species: ["tuber-melanosporum", "tuber-aestivum"],
    peakSeason: "Jun–Aug",
    blurb: "Experimental and commercial blocks near wine regions.",
  },
];
