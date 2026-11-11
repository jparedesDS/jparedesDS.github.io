export type SiteLink = {
  label: string;
  url: string;
  external?: boolean;
};

export type TimelineKind = "work" | "education" | "milestone";

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
  intro:
    "I build computer-vision systems and automation for industrial engineering, and local-first AI products. Currently at EIPSA.",
  availability: "Available for select AI work",
  currentNote: "Currently building inspection models, DocFlow and subany.video.",
  timeline: [
    {
      period: "2026",
      entries: [
        {
          kind: "milestone",
          title: "subany.video",
          description: "Live subtitles and translation, processed in the browser.",
          href: "/work/subany-video/",
        },
        {
          kind: "milestone",
          title: "CleanYourMail",
          description: "Reversible inbox cleanup for coding agents.",
          href: "/cleanyourmail/",
        },
        {
          kind: "milestone",
          title: "CleanYourPhone",
          description: "Reversible Android debloat without root.",
          href: "/work/cleanyourphone/",
        },
      ],
    },
    {
      period: "2024 — Now",
      entries: [
        {
          kind: "work",
          title: "Data Analyst & AI Engineer",
          org: "EIPSA",
          description:
            "Computer vision for metallurgy inspection, DocFlow and ERP automation.",
        },
        {
          kind: "milestone",
          title: "DocFlow",
          description: "Document control for engineering project orders, in production.",
          href: "/work/docflow-saas/",
        },
        {
          kind: "milestone",
          title: "YOLO inspection models",
          description: "Defect detection for metallurgy quality control.",
          href: "https://huggingface.co/jparedesDS/welding-defects-detection",
        },
        {
          kind: "milestone",
          title: "Pro POV CS2",
          description: "Autonomous esports content pipeline.",
          href: "/work/pro-pov-cs2/",
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
        {
          kind: "milestone",
          title: "Kaggle Bronze Medal",
          description: "Multilabel image classification (Futurama frames).",
          href: "https://www.kaggle.com/competitions/comp-mediavida-2-futurama/leaderboard",
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
