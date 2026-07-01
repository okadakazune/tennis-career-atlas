import type { SportLegend, SportId } from "@/data/sports/types";

function legend(
  sport: SportId,
  id: string,
  name: string,
  shortName?: string,
): SportLegend {
  return {
    id,
    name,
    shortName: shortName ?? name.split(" ").at(-1) ?? name,
    sport,
  };
}

export const SPORT_LEGENDS: SportLegend[] = [
  legend("football", "messi", "Lionel Messi", "Messi"),
  legend("football", "ronaldo", "Cristiano Ronaldo", "Ronaldo"),
  legend("football", "maradona", "Diego Maradona", "Maradona"),
  legend("football", "pele", "Pelé", "Pelé"),
  legend("football", "cruyff", "Johan Cruyff", "Cruyff"),
  legend("football", "zidane", "Zinedine Zidane", "Zidane"),

  legend("basketball", "jordan", "Michael Jordan", "Jordan"),
  legend("basketball", "lebron", "LeBron James", "LeBron"),
  legend("basketball", "kobe", "Kobe Bryant", "Kobe"),
  legend("basketball", "magic", "Magic Johnson", "Magic"),
  legend("basketball", "bird", "Larry Bird", "Bird"),
  legend("basketball", "curry", "Stephen Curry", "Curry"),

  legend("baseball", "ruth", "Babe Ruth", "Ruth"),
  legend("baseball", "ohtani", "Shohei Ohtani", "Ohtani"),
  legend("baseball", "ichiro", "Ichiro Suzuki", "Ichiro"),
  legend("baseball", "bonds", "Barry Bonds", "Bonds"),
  legend("baseball", "mays", "Willie Mays", "Mays"),

  legend("formula1", "senna", "Ayrton Senna", "Senna"),
  legend("formula1", "schumacher", "Michael Schumacher", "Schumacher"),
  legend("formula1", "hamilton", "Lewis Hamilton", "Hamilton"),
  legend("formula1", "verstappen", "Max Verstappen", "Verstappen"),

  legend("boxing", "ali", "Muhammad Ali", "Ali"),
  legend("boxing", "tyson", "Mike Tyson", "Tyson"),
  legend("boxing", "mayweather", "Floyd Mayweather", "Mayweather"),
  legend("boxing", "pacquiao", "Manny Pacquiao", "Pacquiao"),

  legend("golf", "tiger-woods", "Tiger Woods", "Tiger"),
  legend("golf", "nicklaus", "Jack Nicklaus", "Nicklaus"),
  legend("golf", "mcilroy", "Rory McIlroy", "McIlroy"),
];

export function getLegendsBySport(sport: SportId): SportLegend[] {
  return SPORT_LEGENDS.filter((entry) => entry.sport === sport);
}
