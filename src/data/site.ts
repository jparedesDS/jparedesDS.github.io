export type SiteLink = {
  label: string;
  url: string;
  external?: boolean;
};

export type ExperienceItem = {
  role: string;
  company: string;
  description: string;
  period: string;
};

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
  intro: string;
  availability: string;
  currentNote: string;
  experience: ExperienceItem[];
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
  intro:
    "I build computer-vision systems and automation for industrial engineering, and local-first AI products. Currently at EIPSA.",
  availability: "Available for select AI work",
  currentNote: "Currently building inspection models, DocFlow and subany.video.",
  experience: [
    {
      role: "Data Analyst & AI Engineer",
      company: "EIPSA",
      description:
        "Computer vision for metallurgy inspection, DocFlow and ERP automation.",
      period: "2024 — Now",
    },
    {
      role: "Data Management Technician",
      company: "Comunicación Permanente",
      description:
        "Customer data, incident reporting and the internal procedures behind them.",
      period: "2021 — 2023",
    },
    {
      role: "Electronics Lab Technician",
      company: "Grupo ANOVO",
      description:
        "Diagnostics, repair and production quality data for consumer devices.",
      period: "2015 — 2020",
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
    "PyTorch",
    "YOLO",
    "OpenCV",
    "FastAPI",
    "React",
    "TypeScript",
    "Docker",
    "SQL",
    "Hugging Face",
  ],
};
