export const site = {
  name: "CM Kerala Grievance Portal",
  shortName: "CM Kerala Grievances",
  description:
    "Submit a public grievance to the Chief Minister's Office, follow it with a reference number and see which department is acting on it. A recruitment prototype with fictional data.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_IN",
  contact: {
    email: "help@cmkerala-portal.example",
    phone: "1800 000 0000",
    hours: "Monday to Saturday, 10 am to 5 pm",
    address: ["Public Grievance Cell (sample)", "Secretariat Annexe", "Thiruvananthapuram 695001"],
  },
} as const;

export const routes = {
  submit: "/submit",
  track: "/track",
} as const;

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/departments", label: "Departments" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/track", label: "Track grievance" },
] as const;

export const publicPages = ["", "/about", "/how-it-works", "/departments", "/faq", "/contact"] as const;

export const districts = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
] as const;

// Keep in step with CATEGORY_LIST in backend/src/config/constants.js.
export const categories = [
  "Roads and Infrastructure",
  "Healthcare",
  "Education",
  "Water Supply",
  "Electricity",
  "Sanitation and Waste",
  "Land and Revenue",
  "Law and Order",
  "Agriculture",
  "Ration and Food Supplies",
  "Transport",
  "Welfare and Pensions",
  "Other",
] as const;

export const priorities = ["Low", "Medium", "High"] as const;
export const statuses = ["Submitted", "Under Review", "In Progress", "Resolved", "Reopened"] as const;
