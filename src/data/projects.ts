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

export type ModelRelease = {
  slug: string;
  name: string;
  description: string;
  version: string;
  year: string;
  links: ProjectLink[];
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
    href: "/work/subany-video/",
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
      { label: "Local app", url: "https://github.com/jparedesDS/cleanyourmail-app", external: true },
      { label: "Code", url: "https://github.com/jparedesDS/cleanyourmail", external: true },
      { label: "Website", url: "https://jparedesds.github.io/cleanyourmail-web/", external: true },
      {
        label: "Release",
        url: "https://github.com/jparedesDS/cleanyourmail/releases/tag/v1.1.5",
        external: true,
      },
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
    href: "/work/docflow-saas/",
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
      { label: "TikTok", url: "https://www.tiktok.com/@propov.cs2", external: true },
      { label: "Instagram", url: "https://www.instagram.com/propovcs2/", external: true },
      { label: "X", url: "https://x.com/ProPOVCS2", external: true },
    ],
    href: "/work/pro-pov-cs2/",
    featured: true,
    detail: true,
    private: true,
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
    href: "/work/trtw-tv/",
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
    href: "/work/cleanyourphone/",
    featured: true,
    detail: true,
    tags: ["Python", "ADB", "Android"],
  },
  {
    slug: "ocr-weapon-detection",
    title: "OCR Weapon Detection in Counter-Strike 2",
    summary: "Captures the screen and detects weapon names in Counter-Strike 2 with optical character recognition.",
    category: "ai-vision",
    year: "2024",
    image: "/images/ocr-identification.png",
    imageAlt: "OCR weapon detection in Counter-Strike 2",
    links: [
      {
        label: "Code",
        url: "https://github.com/jparedesDS/OCR-Identification-CS2-Weapons",
        external: true,
      },
    ],
  },
  {
    slug: "fluorescent-penetrant-inspection",
    title: "Fluorescent Penetrant Inspection",
    summary:
      "Object detection models for liquid penetrant inspection (FPI, DP, LPI, PT) in metallurgy, built with YOLO11.",
    category: "ai-vision",
    year: "2024",
    image: "/images/myyolo11.png",
    imageAlt: "Fluorescent penetrant inspection detection",
    links: [
      {
        label: "Model",
        url: "https://huggingface.co/jparedesDS/fluorescent-penetrant-inspection",
        external: true,
      },
      {
        label: "Code",
        url: "https://github.com/jparedesDS/fluorescent-penetrant-inspection",
        external: true,
      },
    ],
  },
  {
    slug: "dxf-data-extraction",
    title: "Technical Drawing Data Extraction",
    summary:
      "Deep learning that recognises and classifies entities in DXF technical drawings for automated documentation handling.",
    category: "ai-vision",
    year: "2024",
    image: "/images/mydxf.png",
    imageAlt: "DXF technical drawing extraction",
    links: [{ label: "Code", url: "https://github.com/jparedesDS/extract-data-dxf", external: true }],
  },
  {
    slug: "welding-defects-detection",
    title: "Welding Defects Detector",
    summary: "Object detection of welding defects for metallurgy companies, built with YOLO11.",
    category: "ai-vision",
    year: "2024",
    image: "/images/mywelding.jpg",
    imageAlt: "Welding defects detection",
    links: [
      { label: "Model", url: "https://huggingface.co/jparedesDS/welding-defects-detection", external: true },
      { label: "Code", url: "https://github.com/jparedesDS/welding-defects-detection", external: true },
    ],
  },
  {
    slug: "futurama-frame-classification",
    title: "Futurama Frame Classification",
    summary:
      "Multi-label character recognition in Futurama frames; third place in a Kaggle competition with ResNet152 and Keras/TensorFlow.",
    category: "ai-vision",
    year: "2024",
    image: "/images/myimage-classification.png",
    imageAlt: "Futurama frame classification",
    links: [
      {
        label: "Kaggle",
        url: "https://www.kaggle.com/competitions/comp-mediavida-2-futurama/leaderboard",
        external: true,
      },
      {
        label: "Code",
        url: "https://github.com/jparedesDS/image-classification-multilabel",
        external: true,
      },
    ],
  },
  {
    slug: "ai-yolo",
    title: "AI-YOLO Object Detection",
    summary: "Object detection and computer-vision toolkit built on YOLO.",
    category: "ai-vision",
    year: "2024",
    links: [{ label: "Code", url: "https://github.com/jparedesDS/AI-YOLO", external: true }],
  },
  {
    slug: "tableau-documentation-dashboard",
    title: "Documentation Flow Dashboard",
    summary: "A Tableau Public dashboard that tracks document inflow, processing and delivery across projects.",
    category: "data-automation",
    year: "2024",
    image: "/images/tableau-logo.png",
    imageAlt: "Tableau documentation flow dashboard",
    links: [
      {
        label: "Tableau Public",
        url: "https://public.tableau.com/app/profile/jose.paredes6369/viz/INFORMEDEPROGRESO/DASHDOCUMENTACIN",
        external: true,
      },
    ],
  },
  {
    slug: "docucontrol",
    title: "DocuControl",
    summary: "Reporting and document-control automation that analyses exported data and generates advanced visual reports.",
    category: "data-automation",
    year: "2024",
    image: "/images/docucontrol.png",
    imageAlt: "DocuControl reporting",
    links: [],
    private: true,
  },
  {
    slug: "email-mapi-automation",
    title: "Email MAPI Automation",
    summary: "Automates documentation intake from Outlook/IMAP email into Excel and databases.",
    category: "data-automation",
    year: "2024",
    image: "/images/myemailmapi.png",
    imageAlt: "Email MAPI automation",
    links: [
      { label: "Code", url: "https://github.com/jparedesDS/email-mapi-automation", external: true },
    ],
  },
  {
    slug: "eipsa-erp",
    title: "EIPSA ERP",
    summary: "An ERP that manages the daily activities of the different sections of the company.",
    category: "data-automation",
    year: "2024",
    image: "/images/myERP.png",
    imageAlt: "EIPSA ERP",
    links: [{ label: "Code", url: "https://github.com/jparedesDS/ERP_EIPSA", external: true }],
  },
  {
    slug: "hltv-scraper",
    title: "HLTV Team & Player Stats Scraper",
    summary: "Scrapes and analyses individual and team CS2 statistics from HLTV.",
    category: "data-automation",
    year: "2024",
    image: "/images/myhltv.png",
    imageAlt: "HLTV scraper",
    links: [{ label: "Code", url: "https://github.com/jparedesDS/hltv-scraper", external: true }],
  },
  {
    slug: "twitter-emoji-sentiment",
    title: "Twitter Sentiment with Emojis",
    summary: "Classifies the emotional tone of tweets with emojis and natural-language processing techniques.",
    category: "data-automation",
    year: "2024",
    image: "/images/myemoji.png",
    imageAlt: "Twitter emoji sentiment analysis",
    links: [
      {
        label: "Code",
        url: "https://github.com/jparedesDS/NLP-sentiment-analysis-with-emojis",
        external: true,
      },
    ],
  },
  {
    slug: "twitter-sentiment-analysis",
    title: "Twitter Sentiment Analysis",
    summary: "Identifies positive and negative emotions in tweets while exploring natural-language features.",
    category: "data-automation",
    year: "2024",
    image: "/images/mytwittersentiment.png",
    imageAlt: "Twitter sentiment analysis",
    links: [
      {
        label: "Code",
        url: "https://github.com/jparedesDS/tensorflow-twitter-sentiment-analysis",
        external: true,
      },
    ],
  },
  {
    slug: "madrid-traffic-accidents",
    title: "Madrid Traffic Accidents",
    summary: "Analysis and prediction of traffic accidents in the city of Madrid.",
    category: "data-automation",
    year: "2024",
    image: "/images/mytraffic.png",
    imageAlt: "Madrid traffic accidents analysis",
    links: [
      {
        label: "Code",
        url: "https://github.com/jparedesDS/lazy-classifier-traffic-accidents-madrid",
        external: true,
      },
    ],
  },
  {
    slug: "titanic-data-wrangling",
    title: "Titanic Data Wrangling",
    summary: "Complete cleaning and analysis of the Titanic dataset with pandas.",
    category: "data-automation",
    year: "2024",
    links: [{ label: "Code", url: "https://github.com/jparedesDS/data-wrangling-titanic", external: true }],
  },
  {
    slug: "monitoring-report-automation",
    title: "Monitoring Report Automation",
    summary: "Reduces report generation time and minimises manual data-entry errors.",
    category: "data-automation",
    year: "2024",
    links: [{ label: "Code", url: "https://github.com/jparedesDS/monitoring-report", external: true }],
  },
  {
    slug: "workshop-scheduler",
    title: "Auto Repair Shop Scheduler",
    summary:
      "Self-hosted scheduling and customer/vehicle management for garages: service-bay agenda, roadworthiness alerts, notifications and role-based access.",
    category: "products",
    year: "2025",
    image: "/images/workshop-scheduler.svg",
    imageAlt: "Auto repair shop scheduler",
    links: [{ label: "Code", url: "https://github.com/jparedesDS/talleres-ritmo", external: true }],
  },
  {
    slug: "claude-telegram-bot",
    title: "Claude Telegram Bot",
    summary:
      "AI-powered Telegram bot that brings conversational assistance, automation workflows and command interactions to chat.",
    category: "products",
    year: "2025",
    image: "/images/telegram-bot.png",
    imageAlt: "Claude Telegram bot",
    links: [{ label: "Code", url: "https://github.com/jparedesDS/claude-telegram", external: true }],
  },
  {
    slug: "polymarket-autobetting",
    title: "Polymarket Auto-Betting Bot",
    summary:
      "Automated trading bot for BTC prediction markets with limit maker orders, Kelly sizing, a bail-out mechanism and a Telegram control dashboard.",
    category: "products",
    year: "2025",
    image: "/images/polymarket.png",
    imageAlt: "Polymarket auto-betting bot",
    links: [],
    private: true,
  },
  {
    slug: "clutchbot-cs2ai",
    title: "ClutchBot.ai (CS2AI)",
    summary:
      "Conversational AI assistant for Counter-Strike 2 players with tactical guidance, match insights and gameplay support.",
    category: "esports",
    year: "2024",
    image: "/images/cs2ai.svg",
    imageAlt: "ClutchBot.ai",
    links: [],
    private: true,
  },
  {
    slug: "cs2-vrs-predictions",
    title: "CS2 VRS Predictions",
    summary:
      "Predictive pipeline that forecasts CS2 team standings and tournament outcomes from historical performance data.",
    category: "esports",
    year: "2024",
    image: "/images/cs2-vrs.svg",
    imageAlt: "CS2 VRS predictions",
    links: [],
    private: true,
  },
];

export const models: ModelRelease[] = [
  {
    slug: "cs2-yolo12m-weapon-detection",
    name: "Counter Strike 2 Weapon Detector",
    description: "Weapon identification for CS2.",
    version: "YOLO12m",
    year: "2025",
    links: [
      { label: "Model", url: "https://huggingface.co/jparedesDS/cs2-yolo12m-weapon-detection", external: true },
      { label: "GitHub", url: "https://github.com/jparedesDS/cs2-yolo12m-weapon-detection", external: true },
    ],
  },
  {
    slug: "welding-defects-detector",
    name: "Welding Defects Detector",
    description: "Detection of welding defects with AI.",
    version: "YOLO11x",
    year: "2024",
    links: [
      { label: "Model", url: "https://huggingface.co/jparedesDS/welding-defects-detection", external: true },
      { label: "GitHub", url: "https://github.com/jparedesDS/welding-defects-detection", external: true },
    ],
  },
  {
    slug: "liquid-penetrant-test-detection",
    name: "Liquid Penetrant Test (DP, LPI, PT)",
    description: "Detection of liquid penetrant test with AI.",
    version: "YOLO11l",
    year: "2024",
    links: [
      { label: "Model", url: "https://huggingface.co/jparedesDS/liquid-penetrant-test-detection", external: true },
      { label: "GitHub", url: "https://github.com/jparedesDS/fluorescent-penetrant-inspection", external: true },
    ],
  },
  {
    slug: "cs2-players-detector-yolo12s",
    name: "Counter Strike 2 Players Detector",
    description: "Player identification for CS2.",
    version: "YOLO12s",
    year: "2025",
    links: [
      { label: "Model", url: "https://huggingface.co/jparedesDS/cs2_yolo12s", external: true },
      { label: "GitHub", url: "https://github.com/jparedesDS/cs2-object-dectection", external: true },
    ],
  },
  {
    slug: "cs2-players-detector-yolov9",
    name: "Counter Strike 2 Players Detector",
    description: "Player identification for CS2.",
    version: "YOLOv9, YOLOv10 & YOLO11",
    year: "2024",
    links: [
      {
        label: "Model",
        url: "https://huggingface.co/collections/jparedesDS/cs2-yolo-object-detection-66f65a7fa395d5e5ede71489",
        external: true,
      },
      { label: "GitHub", url: "https://github.com/jparedesDS/cs2-object-dectection", external: true },
    ],
  },
  {
    slug: "valorant-players-detector",
    name: "Valorant Players Detector",
    description: "Player identification for Valorant.",
    version: "YOLOv10 & YOLO11",
    year: "2024",
    links: [
      {
        label: "Model",
        url: "https://huggingface.co/collections/jparedesDS/valorant-yolo-object-detection-6708db8eda7c23b8859bcd3b",
        external: true,
      },
      { label: "GitHub", url: "https://github.com/jparedesDS/valorant-object-detection", external: true },
    ],
  },
  {
    slug: "fortnite-players-detector",
    name: "Fortnite Players Detector",
    description: "Player identification for Fortnite.",
    version: "YOLO11",
    year: "2024",
    links: [
      { label: "Model", url: "https://huggingface.co/jparedesDS/fortnite-yolo11m", external: true },
      { label: "GitHub", url: "https://github.com/jparedesDS/fortnite-object-detection", external: true },
    ],
  },
  {
    slug: "overwatch-2-players-detector",
    name: "OverWatch 2 Players Detector",
    description: "Player identification for Overwatch 2.",
    version: "YOLO11",
    year: "2024",
    links: [
      { label: "Model", url: "https://huggingface.co/jparedesDS/ow2-yolo11m", external: true },
      { label: "GitHub", url: "https://github.com/jparedesDS/ow2-object-dectection", external: true },
    ],
  },
  {
    slug: "deadlock-players-detector",
    name: "Deadlock Players Detector",
    description: "Player identification for Deadlock.",
    version: "YOLO11",
    year: "2024",
    links: [
      { label: "Model", url: "https://huggingface.co/jparedesDS/deadlock-yolo11l", external: true },
      { label: "GitHub", url: "https://github.com/jparedesDS/deadlock-object-detection", external: true },
    ],
  },
  {
    slug: "lol-map-tracking",
    name: "League of Legends Map Tracking",
    description: "Identification of all characters through the minimap.",
    version: "YOLO11",
    year: "2024",
    links: [
      {
        label: "GitHub",
        url: "https://github.com/jparedesDS/lol-map-tracking-object-detection",
        external: true,
      },
    ],
  },
];
