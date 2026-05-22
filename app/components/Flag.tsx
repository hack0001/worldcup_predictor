// Maps country/team name to ISO 2-letter code for flag images
const COUNTRY_CODES: Record<string, string> = {
  "Mexico": "mx", "USA": "us", "Canada": "ca", "Morocco": "ma",
  "Germany": "de", "Japan": "jp", "Australia": "au", "Belgium": "be",
  "Argentina": "ar", "France": "fr", "Portugal": "pt", "Nigeria": "ng",
  "Brazil": "br", "England": "gb-eng", "Netherlands": "nl", "South Korea": "kr",
  "Spain": "es", "Italy": "it", "Uruguay": "uy", "Senegal": "sn",
  "Colombia": "co", "Denmark": "dk", "Switzerland": "ch", "Cameroon": "cm",
  "Croatia": "hr", "Ecuador": "ec", "Ghana": "gh", "Saudi Arabia": "sa",
  "Poland": "pl", "Serbia": "rs", "Ivory Coast": "ci", "Qatar": "qa",
  "Turkey": "tr", "Iran": "ir", "New Zealand": "nz", "Wales": "gb-wls",
  "Chile": "cl", "Algeria": "dz", "Costa Rica": "cr", "Oman": "om",
  "Indonesia": "id", "Austria": "at", "Egypt": "eg", "Czech Republic": "cz",
  "Russia": "ru", "Romania": "ro", "Scotland": "gb-sct", "Tunisia": "tn",
};

interface FlagProps {
  country: string;
  size?: number;
}

export default function Flag({ country, size = 20 }: FlagProps) {
  const code = COUNTRY_CODES[country];
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={country}
      width={size}
      height={size * 0.67}
      style={{ borderRadius: "2px", objectFit: "cover", display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}
