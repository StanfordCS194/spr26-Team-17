export const productCatalog = [
  {
    slug: "pulseband",
    route: "/pulseband",
    name: "PulseBand",
    tagline: "Built for motion-first lives.",
    homeDescription:
      "Built for athletes, runners, and gym-goers who want smarter training and faster recovery.",
    homePrice: "From $149",
    homeUsers: "Athletes, runners, gym users",
    heroHeadline: "Train smarter. Recover faster.",
    description:
      "PulseBand is built for athletes, runners, and gym-goers who want real-time performance insights without distraction.",
    targetSegments: ["Athletes", "Runners", "Gym users", "Sports teams"],
    storyImage: {
      src: "/images/pulseband-story.jpg",
      alt: "Athlete catching a breath after training while wearing a fitness wearable on their wrist.",
      badge: "For athletes and recovery days",
      caption:
        "PulseBand shows up in the moments performance-minded people actually care about: during training, after effort, and in recovery.",
      position: "center center"
    },
    features: [
      "Heart rate zones",
      "Workout tracking",
      "Recovery scores",
      "Sleep optimization",
      "Sweat-resistant design",
      "AI training suggestions"
    ],
    pricing: [
      { tier: "Basic", price: "$149", note: "Training essentials and recovery scores" },
      { tier: "Pro", price: "$199", note: "Advanced coaching and readiness analysis" },
      { tier: "Team", price: "$299", note: "Shared dashboards for teams and coaches" }
    ],
    ctaText: "Shop PulseBand",
    theme: {
      accent: "#5465ff",
      accentSoft: "#e5e8ff",
      accentDeep: "#2f3bcf",
      surface:
        "linear-gradient(135deg, rgba(230, 235, 255, 0.95), rgba(255, 255, 255, 0.92))",
      chipBg: "rgba(84, 101, 255, 0.12)",
      chipText: "#3140d6",
      panelTint: "rgba(84, 101, 255, 0.08)",
      mockup: "band"
    },
    highlightStats: [
      { label: "Recovery", value: "92%" },
      { label: "HR zones", value: "5 live" },
      { label: "Battery", value: "8 days" }
    ]
  },
  {
    slug: "pulsering",
    route: "/pulsering",
    name: "PulseRing",
    tagline: "Minimal hardware. Meaningful health insight.",
    homeDescription:
      "Minimal health tracking for professionals, wellness-focused users, and older adults.",
    homePrice: "From $249",
    homeUsers: "Professionals, wellness users, older adults",
    heroHeadline: "Health tracking that disappears into your day.",
    description:
      "PulseRing gives professionals, wellness-focused users, and older adults simple health insights in a minimal, comfortable form.",
    targetSegments: ["Professionals", "Wellness users", "Older adults", "Minimalists"],
    storyImage: {
      src: "/images/pulsering-story.jpg",
      alt: "Calm close-up of clasped hands wearing rings, suggesting a quiet everyday wellness routine.",
      badge: "For calm, everyday wellness",
      caption:
        "PulseRing is designed for people who want health insight to feel gentle, clear, and easy to live with throughout the day.",
      position: "center center"
    },
    features: [
      "Sleep tracking",
      "Stress monitoring",
      "Heart health summaries",
      "Long battery life",
      "Lightweight titanium design",
      "Gentle wellness reminders"
    ],
    pricing: [
      { tier: "Standard", price: "$249", note: "Core health, sleep, and stress tracking" },
      { tier: "Premium", price: "$299", note: "Daily readiness and extended health summaries" },
      { tier: "Family", price: "$699", note: "Three rings plus shared wellness views" }
    ],
    ctaText: "Shop PulseRing",
    theme: {
      accent: "#6e5fff",
      accentSoft: "#ece8ff",
      accentDeep: "#4b3ddd",
      surface:
        "linear-gradient(135deg, rgba(239, 235, 255, 0.95), rgba(255, 255, 255, 0.92))",
      chipBg: "rgba(110, 95, 255, 0.12)",
      chipText: "#5240df",
      panelTint: "rgba(110, 95, 255, 0.08)",
      mockup: "ring"
    },
    highlightStats: [
      { label: "Sleep score", value: "88" },
      { label: "Stress", value: "Low" },
      { label: "Battery", value: "7 days" }
    ]
  },
  {
    slug: "pulsewatch",
    route: "/pulsewatch",
    name: "PulseWatch",
    tagline: "Your everyday command center.",
    homeDescription:
      "An all-in-one smart device for students, tech users, and busy multitaskers.",
    homePrice: "From $399",
    homeUsers: "Students, tech users, multitaskers",
    heroHeadline: "Your life, organized on your wrist.",
    description:
      "PulseWatch combines health, apps, notifications, focus tools, and everyday productivity for students and busy multitaskers.",
    targetSegments: ["Students", "Tech users", "Multitaskers", "Travelers"],
    storyImage: {
      src: "/images/pulsewatch-story.jpg",
      alt: "Person wearing a smartwatch while working on a laptop, emphasizing productivity and multitasking.",
      badge: "For students and multitaskers",
      caption:
        "PulseWatch belongs in the middle of real life: studying, switching contexts, and keeping your day moving without losing focus.",
      position: "70% center"
    },
    features: [
      "Notifications and apps",
      "Focus timers",
      "Calendar reminders",
      "Fitness tracking",
      "Sleep insights",
      "LTE option"
    ],
    pricing: [
      { tier: "Base", price: "$399", note: "Essential apps, health, and focus tools" },
      { tier: "Plus", price: "$499", note: "LTE, deeper customization, longer battery" },
      { tier: "Ultra", price: "$699", note: "Travel-ready materials and premium sensors" }
    ],
    ctaText: "Shop PulseWatch",
    theme: {
      accent: "#3f7bff",
      accentSoft: "#e5f0ff",
      accentDeep: "#225ddd",
      surface:
        "linear-gradient(135deg, rgba(231, 240, 255, 0.95), rgba(255, 255, 255, 0.92))",
      chipBg: "rgba(63, 123, 255, 0.12)",
      chipText: "#215add",
      panelTint: "rgba(63, 123, 255, 0.08)",
      mockup: "watch"
    },
    highlightStats: [
      { label: "Focus", value: "4 sessions" },
      { label: "Apps", value: "42" },
      { label: "Battery", value: "36 hrs" }
    ]
  }
];

export const audienceSegments = [
  {
    title: "Athletes",
    copy: "Performance tracking, recovery scores, and heart rate zones that make every session more intentional."
  },
  {
    title: "Professionals",
    copy: "Stress tracking, sleep insights, and routines that fit around real workdays and meetings."
  },
  {
    title: "Students",
    copy: "Focus sessions, study reminders, and activity balance that help energy last through busy semesters."
  },
  {
    title: "Older adults",
    copy: "Heart monitoring, wellness reminders, and simple health summaries built to feel clear, not noisy."
  },
  {
    title: "Travelers",
    copy: "Jet lag insights, activity tracking, and sleep rhythm support that adapts as time zones shift."
  },
  {
    title: "Creators",
    copy: "Daily energy insights, routine optimization, and notification control when attention is your real resource."
  }
];

export const comparisonRows = [
  {
    device: "PulseBand",
    focus: "Fitness, recovery, workouts",
    bestFor: "Athletes and training-heavy routines",
    price: "$149"
  },
  {
    device: "PulseRing",
    focus: "Sleep, stress, wellness",
    bestFor: "Minimal tracking and daily health insight",
    price: "$249"
  },
  {
    device: "PulseWatch",
    focus: "Apps, focus, health",
    bestFor: "All-day organization and multitasking",
    price: "$399"
  }
];

export const navItems = [
  { label: "Products", href: "/#products", id: "products" },
  { label: "Compare", href: "/#compare", id: "compare" },
  { label: "Segments", href: "/#segments", id: "segments" },
  { label: "Pricing", href: "/#pricing", id: "pricing" }
];
