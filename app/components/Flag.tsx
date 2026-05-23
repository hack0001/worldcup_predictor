import { TEAM_FLAGS } from "@/app/data/worldcup";

interface FlagProps {
  country: string;
  size?: number;
}

export default function Flag({ country, size = 20 }: FlagProps) {
  const code = TEAM_FLAGS[country];
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={country}
      width={size}
      height={Math.round(size * 0.67)}
      style={{ borderRadius: "2px", objectFit: "cover", display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
    />
  );
}
