export type SiteLink = {
  label: string;
  url: string;
  external?: boolean;
};

export type TimelineKind = "work" | "education";

export type TimelineEntry = {
  kind: TimelineKind;
  title: string;
  org?: string;
  description: string;
  href?: string;
};

export type TimelinePeriod = { period: string; entries: TimelineEntry[] };

export type WritingItem = {
  date: string;
  title: string;
  tag: string;
  href: string;
};

export type Site = {
  name: string;
  role: string;
  location: string;
  city: string;
  since: string;
  email: string;
  links: SiteLink[];
  personalSocials: SiteLink[];
  propovSocials: SiteLink[];
  sites: SiteLink[];
  intro: string;
  availability: string;
  currentNote: string;
  timeline: TimelinePeriod[];
  writing: WritingItem[];
  stack: string[];
};

export const site: Site = {
  name: "Jose Paredes",
  role: "Data Scientist / AI Engineer",
  location: "Madrid, Spain",
  city: "Madrid",
  since: "Since 2021",
  email: "jparedescolmenarejo@gmail.com",
  links: [
    { label: "GitHub", url: "https://github.com/jparedesDS", external: true },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/jparedesDS/", external: true },
    { label: "Email", url: "mailto:jparedescolmenarejo@gmail.com" },
    { label: "CV", url: "/resume.pdf" },
  ],
  personalSocials: [
    { label: "X", url: "https://x.com/xhitoCS", external: true },
    { label: "Instagram", url: "https://www.instagram.com/xhitoCS/", external: true },
  ],
  propovSocials: [
    { label: "YouTube", url: "https://www.youtube.com/@Pro.POV.CS2", external: true },
    { label: "TikTok", url: "https://www.tiktok.com/@propov.cs2", external: true },
    { label: "Instagram", url: "https://www.instagram.com/propovcs2", external: true },
    { label: "X", url: "https://x.com/ProPOVCS2", external: true },
    { label: "Twitch", url: "https://www.twitch.tv/propovcs2", external: true },
    { label: "Kick", url: "https://kick.com/propovcs2", external: true },
  ],
  sites: [
    { label: "Subany", url: "https://subany.video/", external: true },
    { label: "CleanYourMail", url: "https://cleanyourmail.org/", external: true },
    { label: "CleanYourPhone", url: "https://cleanyourphone.org/", external: true },
  ],
  intro:
    "I build computer-vision systems and automation for industrial engineering, and local-first AI products. Currently at EIPSA.",
  availability: "Available for select AI work",
  currentNote: "Currently building inspection models, DocFlow and subany.video.",
  timeline: [
    {
      period: "2024 — Now",
      entries: [
        {
          kind: "work",
          title: "Data Analyst & AI Engineer",
          org: "EIPSA",
          description:
            "Computer vision for metallurgy inspection and data automation.",
        },
      ],
    },
    {
      period: "2021 — 2023",
      entries: [
        {
          kind: "work",
          title: "Data Management Technician",
          org: "Comunicación Permanente",
          description:
            "Customer data, incident reporting and the internal procedures behind them.",
        },
        {
          kind: "education",
          title: "Data Science Bootcamp",
          org: "The Bridge",
          description:
            "Supervised and unsupervised learning, deep learning, NLP, computer vision and Flask deployment.",
        },
      ],
    },
    {
      period: "2015 — 2020",
      entries: [
        {
          kind: "work",
          title: "Electronics Lab Technician",
          org: "Grupo ANOVO",
          description:
            "Diagnostics, repair and production quality data for consumer devices.",
        },
      ],
    },
    {
      period: "2010 — 2012",
      entries: [
        {
          kind: "education",
          title: "Telecommunications",
          org: "Centro de Formación Padre Piquer",
          description: "Advanced Vocational Degree in Telecommunications.",
        },
      ],
    },
  ],
  writing: [
    {
      date: "09 Nov 2026",
      title: "How subany.video works: live subtitles in the browser",
      tag: "Engineering",
      href: "https://jparedesds.github.io/blog/2026/11/09/how-subany-video-works/",
    },
    {
      date: "09 Nov 2026",
      title: "Cómo funciona subany.video: subtítulos en directo",
      tag: "Español",
      href: "https://jparedesds.github.io/blog/2026/11/09/como-funciona-subany-video/",
    },
  ],
  stack: [
    "Python",
    "Jupyter",
    "JavaScript",
    "TypeScript",
    "HTML/CSS",
    "PyTorch",
    "TensorFlow",
    "Keras",
    "YOLO",
    "OpenCV",
    "scikit-learn",
    "Pandas",
    "NumPy",
    "NLP",
    "Hugging Face",
    "FastAPI",
    "Flask",
    "React",
    "Docker",
    "SQL",
    "SQLite",
    "PostgreSQL",
    "GitHub Actions",
    "Tableau",
    "BeautifulSoup",
    "ADB",
    "WebGPU",
    "Whisper",
    "ONNX",
    "FFmpeg",
    "Claude",
    "AI agents",
    "Local-first",
  ],
};
