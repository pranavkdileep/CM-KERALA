import {
  Building,
  Bus,
  Construction,
  Droplets,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Landmark,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Department = {
  slug: string;
  name: string;
  summary: string;
  handles: string[];
  icon: LucideIcon;
  featured?: boolean;
};

// Sample departments for the prototype. Names are generic and descriptions are fictional.
export const departments: Department[] = [
  {
    slug: "public-works",
    name: "Public Works",
    summary: "State roads, bridges and government buildings, from potholes to stalled construction.",
    handles: ["Damaged roads", "Unsafe bridges", "Delayed public works"],
    icon: Construction,
    featured: true,
  },
  {
    slug: "health",
    name: "Health and Family Welfare",
    summary: "Government hospitals, primary health centres, medicine supply and public health drives.",
    handles: ["Hospital services", "Medicine shortage", "Sanitation and disease control"],
    icon: HeartPulse,
    featured: true,
  },
  {
    slug: "local-self-government",
    name: "Local Self Government",
    summary: "Panchayats, municipalities and corporations: streetlights, waste collection, building permits and certificates.",
    handles: ["Waste collection", "Streetlights", "Permits and certificates"],
    icon: Building,
    featured: true,
  },
  {
    slug: "water-resources",
    name: "Water Resources",
    summary: "Drinking water supply, pipeline leaks, irrigation canals and flood protection works.",
    handles: ["No water supply", "Pipeline leaks", "Canal and bund repair"],
    icon: Droplets,
    featured: true,
  },
  {
    slug: "general-education",
    name: "General Education",
    summary: "Government and aided schools, scholarships, mid day meals and school infrastructure.",
    handles: ["School facilities", "Scholarship delays", "Teacher vacancies"],
    icon: GraduationCap,
    featured: true,
  },
  {
    slug: "revenue",
    name: "Revenue",
    summary: "Land records, village office services, disaster relief payments and revenue certificates.",
    handles: ["Land records", "Relief payments", "Certificate delays"],
    icon: Landmark,
    featured: true,
  },
  {
    slug: "power",
    name: "Power",
    summary: "Electricity supply, new connections, billing disputes and dangerous lines or poles.",
    handles: ["Frequent outages", "Billing disputes", "Unsafe lines"],
    icon: Zap,
  },
  {
    slug: "home",
    name: "Home",
    summary: "Police services, public safety and delays in complaint registration or action.",
    handles: ["Police inaction", "Public safety", "Traffic enforcement"],
    icon: ShieldCheck,
  },
  {
    slug: "agriculture",
    name: "Agriculture and Farmers' Welfare",
    summary: "Crop insurance, subsidies, seed and fertiliser supply and procurement payments.",
    handles: ["Crop loss compensation", "Subsidy delays", "Procurement payments"],
    icon: Sprout,
  },
  {
    slug: "civil-supplies",
    name: "Food and Civil Supplies",
    summary: "Ration cards, ration shop service and the public distribution system.",
    handles: ["Ration card issues", "Ration shop complaints", "Supply shortages"],
    icon: ShoppingBasket,
  },
  {
    slug: "transport",
    name: "Transport",
    summary: "Public bus services, driving licences, vehicle registration and road safety.",
    handles: ["Bus service gaps", "Licence delays", "Registration issues"],
    icon: Bus,
  },
  {
    slug: "social-justice",
    name: "Social Justice",
    summary: "Welfare pensions, support for persons with disabilities, senior citizens and transgender persons.",
    handles: ["Pension delays", "Disability support", "Welfare schemes"],
    icon: HandHeart,
  },
];

export const featuredDepartments = departments.filter((d) => d.featured);
