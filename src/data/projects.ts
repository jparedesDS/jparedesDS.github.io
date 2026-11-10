export type ProjectLink = { label: string; url: string; external?: boolean };

export type Project = {
  slug: string;
  title: string;
  summary: string;
  category: "ai-vision" | "data-automation" | "products" | "esports";
  year: string;
  image?: string;
  imageAlt?: string;
  links: ProjectLink[];
  href?: string;
  featured?: boolean;
  detail?: boolean;
  private?: boolean;
  /** Short technology chips shown on the home card. */
  tags?: string[];
};

export const projects: Project[] = [
  {
    slug: "subany-video",
    title: "subany.video",
    summary: "Live subtitles and translation for streams, processed locally in the browser.",
    category: "ai-vision",
    year: "2026",
    image: "/images/subany-video-thumb.png",
    imageAlt: "subany.video interface",
    links: [
      { label: "Website", url: "https://subany.video/", external: true },
      { label: "Code", url: "https://github.com/jparedesDS/subtitle.me", external: true },
    ],
    featured: true,
    detail: true,
    tags: ["TypeScript", "WebGPU", "Whisper"],
  },
  {
    slug: "cleanyourmail",
    title: "CleanYourMail",
    summary: "An agent-native CLI that files mail without reading bodies or deleting anything.",
    category: "products",
    year: "2026",
    image: "/images/cleanyourmail.png",
    imageAlt: "CleanYourMail interface",
    links: [
      { label: "Case study", url: "/cleanyourmail/" },
      { label: "Code", url: "https://github.com/jparedesDS/cleanyourmail", external: true },
    ],
    href: "/cleanyourmail/",
    featured: true,
    tags: ["Python", "IMAP", "CLI"],
  },
  {
    slug: "docflow-saas",
    title: "DocFlow",
    summary: "Multi-tenant document control that keeps project files archived, searchable and auditable.",
    category: "data-automation",
    year: "2024",
    image: "/images/docflow.svg",
    imageAlt: "DocFlow",
    links: [{ label: "Code", url: "https://github.com/jparedesDS/docflow", external: true }],
    featured: true,
    detail: true,
    tags: ["FastAPI", "React", "Docker"],
  },
  {
    slug: "pro-pov-cs2",
    title: "Pro POV CS2",
    summary: "Match discovery, demo parsing, POV recording and publishing, end to end.",
    category: "esports",
    year: "2025",
    image: "/images/propov-cs2.png",
    imageAlt: "Pro POV CS2",
    links: [
      { label: "Web", url: "/propovcs2/" },
      { label: "YouTube", url: "https://www.youtube.com/@Pro.POV.CS2", external: true },
    ],
    featured: true,
    detail: true,
    tags: ["Python", "CS2", "Automation"],
  },
  {
    slug: "trtw-tv",
    title: "trtw.tv",
    summary: "Live Spanish subtitles for Twitch and YouTube, transcribed locally with Whisper.",
    category: "products",
    year: "2025",
    image: "/images/trtw-tv.png",
    imageAlt: "trtw.tv live subtitles",
    links: [{ label: "Code", url: "https://github.com/jparedesDS/trtw-tv", external: true }],
    featured: true,
    detail: true,
    tags: ["TypeScript", "Whisper", "Chrome"],
  },
  {
    slug: "cleanyourphone",
    title: "CleanYourPhone",
    summary: "Reversible Android debloating over ADB, with no root and a one-command undo.",
    category: "products",
    year: "2026",
    image: "/images/cleanyourphone-thumb.png",
    imageAlt: "CleanYourPhone interface",
    links: [
      { label: "Website", url: "https://jparedesds.github.io/cleanyourphone-web/", external: true },
      { label: "Code", url: "https://github.com/jparedesDS/clean-your-phone", external: true },
    ],
    featured: true,
    detail: true,
    tags: ["Python", "ADB", "Android"],
  },
];
