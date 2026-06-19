/** Static official-source pins merged onto the Confusion Map (blue layer). */
export type OfficialFeedPin = {
  id: string;
  name: string;
  category: string;
  url: string;
  lat: number;
  lng: number;
  label: string;
  summary: string;
};

export const OFFICIAL_FEED_PINS: OfficialFeedPin[] = [
  {
    id: "official-gema",
    name: "Georgia Emergency Management",
    category: "Emergency Alerts",
    url: "https://gema.georgia.gov/",
    lat: 33.749,
    lng: -84.388,
    label: "Atlanta, GA",
    summary: "Official state emergency alerts and preparedness guidance.",
  },
  {
    id: "official-211",
    name: "Georgia 211",
    category: "Community Services",
    url: "https://www.georgia211.org/",
    lat: 33.775,
    lng: -84.296,
    label: "Decatur, GA",
    summary: "Verified community services, food, housing, and crisis support.",
  },
  {
    id: "official-aps",
    name: "Atlanta Public Schools",
    category: "Schools",
    url: "https://www.atlantapublicschools.us/",
    lat: 33.753,
    lng: -84.39,
    label: "Downtown Atlanta",
    summary: "Official school closure and safety announcements.",
  },
  {
    id: "official-acfb",
    name: "Atlanta Community Food Bank",
    category: "Food Banks",
    url: "https://www.acfb.org/",
    lat: 33.739,
    lng: -84.352,
    label: "Memorial Drive",
    summary: "Verified food bank hours, distributions, and closures.",
  },
  {
    id: "official-marta",
    name: "MARTA",
    category: "Transportation",
    url: "https://www.itsmarta.com/",
    lat: 33.781,
    lng: -84.388,
    label: "Midtown Atlanta",
    summary: "Official transit service alerts and detours.",
  },
];
