type CountryFlagProps = {
  country?: string | null;
  league?: string | null;
  flag?: string | null;
  className?: string;
};

const EMOJI_TO_CODE: Record<string, string> = {
  "🇫🇷": "fr",
  "🇮🇹": "it",
  "🇩🇪": "de",
  "🇪🇸": "es",
  "🇬🇧": "gb",
  "🏴": "gb-eng",
  "🇳🇱": "nl",
  "🇵🇹": "pt",
  "🇧🇪": "be",
  "🇹🇷": "tr",
  "🇧🇷": "br",
  "🇦🇷": "ar",
  "🇺🇸": "us",
  "🇭🇷": "hr",
};

const TEXT_TO_CODE: Record<string, string> = {
  france: "fr",
  "ligue 1": "fr",
  "ligue 2": "fr",
  italy: "it",
  italie: "it",
  "serie a": "it",
  "serie b": "it",
  germany: "de",
  allemagne: "de",
  bundesliga: "de",
  "2. bundesliga": "de",
  spain: "es",
  espagne: "es",
  laliga: "es",
  "la liga": "es",
  england: "gb-eng",
  angleterre: "gb-eng",
  "premier league": "gb-eng",
  championship: "gb-eng",
  netherlands: "nl",
  "pays-bas": "nl",
  eredivisie: "nl",
  portugal: "pt",
  "liga portugal": "pt",
  "primeira liga": "pt",
  belgium: "be",
  belgique: "be",
  turkey: "tr",
  turquie: "tr",
  brazil: "br",
  "brésil": "br",
  argentina: "ar",
  argentine: "ar",
  usa: "us",
  "united states": "us",
  croatia: "hr",
  croatie: "hr",
  hnl: "hr",
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getCode({ country, league, flag }: CountryFlagProps): string {
  if (flag && /^https?:\/\//.test(flag)) return "";
  if (flag && EMOJI_TO_CODE[flag]) return EMOJI_TO_CODE[flag];

  const countryKey = country ? normalize(country) : "";
  if (countryKey && TEXT_TO_CODE[countryKey]) return TEXT_TO_CODE[countryKey];

  const leagueKey = league ? normalize(league) : "";
  if (leagueKey && TEXT_TO_CODE[leagueKey]) return TEXT_TO_CODE[leagueKey];

  return "";
}

function fallbackText(country?: string | null, league?: string | null): string {
  const source = country || league || "";
  const compact = source.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
  return compact || "•";
}

export function CountryFlag({ country, league, flag, className }: CountryFlagProps) {
  const base =
    className ||
    "h-[15px] w-[22px] shrink-0 overflow-hidden rounded-[3px] border border-white/10 object-cover";

  if (flag && /^https?:\/\//.test(flag)) {
    return <img src={flag} alt={country || league || "Pays"} className={base} />;
  }

  const code = getCode({ country, league, flag });
  if (code) {
    return (
      <img
        src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
        alt={country || league || code.toUpperCase()}
        className={base}
      />
    );
  }

  return (
    <span
      className={`${base} flex items-center justify-center bg-white/[0.045] text-[8px] font-black tracking-[0.04em] text-[rgba(243,246,247,0.58)]`}
    >
      {fallbackText(country, league)}
    </span>
  );
}
