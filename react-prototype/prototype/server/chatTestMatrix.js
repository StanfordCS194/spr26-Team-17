/**
 * Canonical chat + personalization for QA / class demos.
 * Matches are evaluated top-to-bottom; first win. Use exact phrases from the test plan where possible.
 */

function norm(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** @param {{ slug: string, reply: string } & Record<string, unknown>} p */
function personalizationBase(p) {
  const slug = p.slug;
  /** @type {Record<string, { name: string; tiers: string[] }>} */
  const map = {
    pulseband: { name: "PulseBand", tiers: ["Basic", "Pro", "Team"] },
    pulsering: { name: "PulseRing", tiers: ["Standard", "Premium", "Family"] },
    pulsewatch: { name: "PulseWatch", tiers: ["Base", "Plus", "Ultra"] },
  };
  const m = map[slug] || map.pulsewatch;
  const tier =
    typeof p.highlightedPricingTier === "string"
      ? p.highlightedPricingTier
      : p.tierPick === "high"
        ? m.tiers[2]
        : p.tierPick === "low"
          ? m.tiers[0]
          : m.tiers[1];

  return {
    recommendedSlug: slug,
    recommendedProductName: m.name,
    focusAudience: String(p.focusAudience ?? "Everyday users"),
    priorities: Array.isArray(p.priorities) ? p.priorities.slice(0, 4) : ["health", "focus"],
    featuredSegments: Array.isArray(p.featuredSegments) ? p.featuredSegments.slice(0, 3) : ["Students", "Professionals"],
    comparisonFocus: m.name,
    highlightedPricingTier: tier,
    followUpPrompts: Array.isArray(p.followUpPrompts)
      ? p.followUpPrompts.slice(0, 4)
      : ["Compare devices", "Explain pricing", "Best for my routine?"],
    heroTitle: String(p.heroTitle ?? `Built around ${m.name}`),
    heroDescription: String(
      p.heroDescription ?? "The site is tuned to what you told us about your day and goals."
    ),
    ctaLabel: String(p.ctaLabel ?? `Shop ${m.name}`),
    summary: String(p.summary ?? p.heroDescription ?? ""),
  };
}

function pack(slug, reply, extra) {
  return {
    reply,
    personalization: personalizationBase({ slug, reply, ...extra }),
  };
}

/**
 * @returns {{ reply: string, personalization: object } | null}
 */
export function tryMatchCanonicalResponse(rawMessage) {
  const n = norm(rawMessage);
  if (!n) return null;

  /** @type {Array<{ m: (s: string) => boolean, r: () => { reply: string, personalization: object } }>} */
  const rules = [
    // UI starter chips — must resolve before Gemini so demos show three distinct picks
    {
      m: (s) =>
        /\best wearable\b|\bwearable\b/.test(s) &&
        /\brecovery\b/.test(s) &&
        /\btraining\b/.test(s) &&
        /\bperformance\b/.test(s),
      r: () =>
        pack(
          "pulseband",
          "PulseBand is tuned for athletes—recovery, pacing, and training performance are its core.",
          {
            focusAudience: "Athletes optimizing training cycles",
            priorities: ["recovery", "training loads", "performance"],
            featuredSegments: ["Athletes", "Runners", "Gym users"],
            tierPick: "high",
            heroTitle: "PulseBand for recovery you can repeat.",
            heroDescription:
              "Surfaces readiness, stride trends, and training stress so repeats feel predictable instead of reckless.",
            ctaLabel: "Shop PulseBand for training days",
            followUpPrompts: ["Explain recovery readiness", "Compare with PulseWatch", "See Team pricing"],
            summary: "Recommendation: PulseBand — training + recovery + performance wording.",
          }
        ),
    },
    {
      m: (s) =>
        /\baffordable\b|\bbudget\b/.test(s) &&
        /\bwellness\b/.test(s) &&
        /\bhealth\b/.test(s),
      r: () =>
        pack(
          "pulsering",
          "PulseRing is the streamlined pick for wellness and daily insight without flagship watch pricing.",
          {
            focusAudience: "Budget-aware wellness seekers",
            priorities: ["value", "wellness", "daily rhythm"],
            featuredSegments: ["Wellness users", "Professionals", "Older adults"],
            tierPick: "low",
            heroTitle: "PulseRing — calm insight, approachable price.",
            heroDescription:
              "Leans stress, sleep, and daily health summaries with transparent tiering for tighter budgets.",
            ctaLabel: "See PulseRing pricing",
            followUpPrompts: ["Stress vs sleep breakdown", "Family bundle", "Compare with PulseBand"],
            summary: "Recommendation: PulseRing — affordable wellness + daily health storyline.",
          }
        ),
    },
    {
      m: (s) =>
        /\bstudent\b/.test(s) &&
        /\b(focus|sleep)\b/.test(s) &&
        /\bworkouts?\b/.test(s),
      r: () =>
        pack(
          "pulsewatch",
          "PulseWatch balances school rhythms: focus tools, sleep context, still enough fitness for weekday workouts.",
          {
            focusAudience: "Busy students juggling health and study blocks",
            priorities: ["sleep", "focus", "movement"],
            featuredSegments: ["Students", "Creators"],
            tierPick: "mid",
            heroTitle: "PulseWatch splits focus, recovery, and class days.",
            heroDescription:
              "Highlights multitasking timelines, bedtime insights, and light training blocks without leaving campus mode.",
            ctaLabel: "Configure PulseWatch for students",
            followUpPrompts: ["LTE on campus?", "Quiet hours for study", "Compare with PulseRing"],
            summary: "Recommendation: PulseWatch — student + focus + sleep + workouts blend.",
          }
        ),
    },
    // 33 Highly detailed (before generic "student")
    {
      m: (s) =>
        s.includes("student") &&
        s.includes("work part-time") &&
        s.includes("stay healthy"),
      r: () =>
        pack(
          "pulsewatch",
          "That’s a lot—this helps you manage everything.",
          {
            focusAudience: "Busy students",
            priorities: ["organization", "balance", "energy"],
            featuredSegments: ["Students", "Professionals", "Creators"],
            heroTitle: "PulseWatch for a packed, multi-goal routine.",
            heroDescription:
              "Emphasizes scheduling, multitasking, health tracking, and simple ways to rebalance demanding weeks.",
            ctaLabel: "See PulseWatch setups",
            followUpPrompts: ["Balance academics and workouts", "See battery life", "Compare with PulseBand"],
            summary: "Multi-goal messaging: PulseWatch keeps school, part-time work, and health cues in one place.",
          }
        ),
    },
    // 28 Dual student + fitness
    {
      m: (s) => s.includes("student") && s.includes("stay fit"),
      r: () =>
        pack(
          "pulsewatch",
          "Nice balance—this helps with both.",
          {
            focusAudience: "Students who train",
            priorities: ["study", "fitness", "sleep"],
            featuredSegments: ["Students", "Athletes"],
            tierPick: "mid",
            heroTitle: "PulseWatch for class days and workout days.",
            heroDescription:
              "Hybrid messaging: calendars, reminders, and fitness tracking side by side.",
            summary: "Hybrid student + fitness: PulseWatch highlighted with both lifestyles.",
          }
        ),
    },
    // 29 Athlete + student
    {
      m: (s) => s.includes("train a lot") && s.includes("school"),
      r: () =>
        pack(
          "pulsewatch",
          "Got it. This helps you manage both.",
          {
            focusAudience: "Student athletes",
            priorities: ["performance", "schedule", "recovery"],
            featuredSegments: ["Athletes", "Students"],
            heroTitle: "PulseWatch when you compete and cram.",
            heroDescription: "Athlete telemetry plus class-friendly focus tools and reminders.",
            summary: "Hybrid athlete + student messaging on PulseWatch.",
          }
        ),
    },
    // 38 Style + fitness
    {
      m: (s) =>
        (s.includes("stylish") || s.includes("style")) &&
        (s.includes("workout") || s.includes("workouts")),
      r: () =>
        pack(
          "pulsering",
          "Great combo—this balances both.",
          {
            focusAudience: "Style-aware movers",
            priorities: ["design", "wellness", "activity"],
            featuredSegments: ["Creators", "Athletes"],
            heroTitle: "PulseRing — minimal look, real health signal.",
            heroDescription: "Emphasizes materials, comfort, and clean metrics that pair with fashionable routines.",
            summary: "Style + workouts: PulseRing pairing.",
          }
        ),
    },
    // 1 Fitness-focused
    {
      m: (s) => s.includes("stay active") && s.includes("healthy"),
      r: () =>
        pack(
          "pulseband",
          "Great fit. This is perfect for staying active and consistent.",
          {
            focusAudience: "Fitness-focused movers",
            priorities: ["training", "consistency", "recovery"],
            featuredSegments: ["Athletes", "Travelers"],
            heroTitle: "PulseBand stays with your active streak.",
            heroDescription: "Fitness-oriented pacing, workouts, and recovery surfaced first.",
            summary: "Opens fitness-forward PulseBand storyline across the storefront.",
          }
        ),
    },
    // 2 Student productivity
    {
      m: (s) => s.includes("student") && (s.includes("productive") || s.includes("organized")),
      r: () =>
        pack(
          "pulsewatch",
          "Got it. This will help you stay organized and focused throughout your day.",
          {
            focusAudience: "Students",
            priorities: ["study", "focus", "notifications"],
            featuredSegments: ["Students", "Creators"],
            heroTitle: "PulseWatch keeps semesters on rails.",
            heroDescription: "Student productivity: focus modes, calendars, reminders, and sane notification habits.",
            summary: "Switches storefront to student productivity framing.",
          }
        ),
    },
    // 3 Athlete performance (“get faster” does not include word “performance”)
    {
      m: (s) =>
        s.includes("athlete") &&
        (s.includes("faster") || s.includes("performance")),
      r: () =>
        pack(
          "pulseband",
          "Nice. Let’s optimize this for performance and training.",
          {
            focusAudience: "Performance athletes",
            priorities: ["speed", "training", "recovery"],
            featuredSegments: ["Athletes"],
            tierPick: "high",
            heroTitle: "PulseBand for performance reps.",
            heroDescription: "Interval logic, pacing, and readiness for speed and power demands.",
            summary: "Athlete / performance storefront emphasis.",
          }
        ),
    },
    // 4 Busy professional — before generic "busy"
    {
      m: (s) => s.includes("full-time") || (s.includes("work") && s.includes("always behind")),
      r: () =>
        pack(
          "pulsewatch",
          "Got you. This is great for staying on top of a packed schedule.",
          {
            focusAudience: "Busy professionals",
            priorities: ["productivity", "schedule", "alerts"],
            featuredSegments: ["Professionals", "Travelers"],
            heroTitle: "PulseWatch guards a packed calendar.",
            heroDescription:
              "Productivity tools surface: prioritized alerts, timelines, glanceable agendas.",
            summary: "Emphasizes productivity tools for overloaded work weeks.",
          }
        ),
    },
    // 5 Minimalist
    {
      m: (s) => s.includes("don't want anything complicated") || s.includes("do not want anything complicated"),
      r: () =>
        pack(
          "pulsering",
          "No problem. I’ll keep things simple and focused on essentials.",
          {
            focusAudience: "Minimalists",
            priorities: ["simplicity", "battery", "calm UX"],
            featuredSegments: ["Older adults", "Professionals"],
            tierPick: "low",
            heroTitle: "PulseRing: smallest surface, clearer signals.",
            heroDescription:
              "Simplified messaging strips extras and highlights essentials only.",
            summary: "Simplified messaging path.",
          }
        ),
    },
    // 21 Developer / fewer distractions — before generic "distraction"
    {
      m: (s) => (s.includes("code") || s.includes("coding")) && s.includes("distraction"),
      r: () =>
        pack(
          "pulsewatch",
          "Got it. Let’s optimize for focus.",
          {
            focusAudience: "Developers",
            priorities: ["focus", "notifications", "do not disturb"],
            featuredSegments: ["Creators", "Professionals"],
            heroTitle: "PulseWatch respects deep work.",
            heroDescription: "Quiet notification paths, timers, heads-down summaries.",
            summary: "Developer / distraction-minimized messaging.",
          }
        ),
    },
    // 40 Emotional motivation — before vague "goal"
    {
      m: (s) => s.includes("get my life together"),
      r: () =>
        pack(
          "pulsering",
          "I hear you—this helps make your day more manageable.",
          {
            focusAudience: "Everyday seekers",
            priorities: ["habits", "sleep", "stress"],
            featuredSegments: ["Professionals", "Students"],
            heroTitle: "PulseRing for steadier rhythms.",
            heroDescription: "Supportive copy leans wellness and gentle structure without overwhelm.",
            summary: "Supportive emotional motivation tone.",
          }
        ),
    },
    // 12 Gym user — before athlete
    {
      m: (s) => s.includes("lift") && s.includes("weight"),
      r: () =>
        pack(
          "pulseband",
          "Great. This helps you track workouts and stay consistent.",
          {
            focusAudience: "Gym users",
            priorities: ["lifting", "strength", "consistency"],
            featuredSegments: ["Athletes"],
            heroTitle: "PulseBand anchors gym blocks.",
            summary: "Gym-focused messaging.",
          }
        ),
    },
    // 11 Runner (avoid “run alone”, “running” errands)
    {
      m: (s) =>
        /\b(run|running)\b/.test(s) &&
        !s.includes("alone") &&
        (s.includes("every day") || s.includes("everyday") || s.includes("mile") || s.includes("runs")),
      r: () =>
        pack(
          "pulseband",
          "Nice. Let’s focus on tracking your runs.",
          {
            focusAudience: "Runners",
            priorities: ["pace", "distance", "recovery"],
            featuredSegments: ["Athletes", "Travelers"],
            heroTitle: "PulseBand for daily miles.",
            summary: "Running-focused storefront.",
          }
        ),
    },
    // 17 Safety-conscious (run alone) — narrower
    {
      m: (s) => (s.includes("run alone") || s.includes("safety")),
      r: () =>
        pack(
          "pulsewatch",
          "Got it. This can help you stay connected and feel secure.",
          {
            focusAudience: "Solo movers",
            priorities: ["safety", "location", "LTE"],
            featuredSegments: ["Travelers", "Professionals"],
            tierPick: "high",
            heroTitle: "PulseWatch LTE for peace of mind outdoors.",
            summary: "Safety / connected messaging.",
          }
        ),
    },
    // 6 Tech enthusiast / premium newest
    {
      m: (s) => s.includes("newest") || s.includes("most advanced"),
      r: () =>
        pack(
          "pulsewatch",
          "Perfect. You’ll love the advanced features here.",
          {
            focusAudience: "Tech enthusiasts",
            priorities: ["innovation", "apps", "sensors"],
            featuredSegments: ["Creators", "Students"],
            tierPick: "high",
            heroTitle: "PulseWatch Ultra — flagship tooling.",
            heroDescription: "Highlights bleeding-edge sensors and premium apps.",
            summary: "Premium / advanced SKU emphasis.",
          }
        ),
    },
    // 7 Wellness stressed (narrow: avoid matching generic “wellness” before stress+health sentences)
    {
      m: (s) => s.includes("stressed") && s.includes("health"),
      r: () =>
        pack(
          "pulsering",
          "That’s a great goal. This can help you build healthier habits.",
          {
            focusAudience: "Wellness seekers",
            priorities: ["stress", "recovery", "habits"],
            featuredSegments: ["Professionals", "Older adults"],
            heroTitle: "PulseRing lowers the noise.",
            summary: "Wellness + habit framing.",
          }
        ),
    },
    // 8 Traveler
    {
      m: (s) => s.includes("travel"),
      r: () =>
        pack(
          "pulsewatch",
          "Got it. This is built to keep up with you wherever you go.",
          {
            focusAudience: "Travelers",
            priorities: ["jet lag", "battery", "reliability"],
            featuredSegments: ["Travelers", "Professionals"],
            tierPick: "high",
            heroTitle: "PulseWatch survives long-haul rhythms.",
            summary: "Mobility / reliability storefront.",
          }
        ),
    },
    // 9 Parent / organizer (narrow so “juggling a lot” hits case 20 instead)
    {
      m: (s) =>
        s.includes("kids") ||
        (s.includes("juggling") && (s.includes("everything") || s.includes("work")) && !s.includes("juggling a lot")),
      r: () =>
        pack(
          "pulsewatch",
          "Sounds busy—this will help you keep everything on track.",
          {
            focusAudience: "Parents & organizers",
            priorities: ["reminders", "calendar", "alerts"],
            featuredSegments: ["Professionals", "Travelers"],
            heroTitle: "PulseWatch stitches family logistics.",
            summary: "Scheduling + reminders storyline.",
          }
        ),
    },
    // 10 Phone reduction / glanceable
    {
      m: (s) =>
        s.includes("phone") && (s.includes("stop checking") || s.includes("checking my phone")),
      r: () =>
        pack(
          "pulsering",
          "Makes sense. This helps you stay connected without constant phone use.",
          {
            focusAudience: "Low-screen users",
            priorities: ["glanceable", "calm UX", "briefings"],
            featuredSegments: ["Professionals"],
            tierPick: "mid",
            heroTitle: "PulseRing for quick summaries on your wrist.",
            summary: "Glanceables / lighter phone pickups.",
          }
        ),
    },
    // 13 Weight loss
    {
      m: (s) => s.includes("lose weight") || s.includes("weight loss"),
      r: () =>
        pack(
          "pulsering",
          "Got it. This helps you stay accountable.",
          {
            focusAudience: "Accountability seekers",
            priorities: ["movement", "trends", "habits"],
            featuredSegments: ["Athletes"],
            tierPick: "mid",
            heroTitle: "PulseRing makes daily movement visible.",
            summary: "Weight-loss accountability storyline.",
          }
        ),
    },
    // 14 Sleep-focused
    {
      m: (s) => s.includes("sleep better"),
      r: () =>
        pack(
          "pulsering",
          "That’s a great place to start. This helps you understand your sleep.",
          {
            focusAudience: "Sleep optimizers",
            priorities: ["sleep", "recovery", "stress"],
            featuredSegments: ["Older adults", "Professionals"],
            tierPick: "mid",
            heroTitle: "PulseRing sleeps with you—not against you.",
            summary: "Sleep messaging.",
          }
        ),
    },
    // 15 Premium design looks good
    {
      m: (s) => (s.includes("looks really good") || s.includes("looks good")) && !s.includes("gift"),
      r: () =>
        pack(
          "pulsering",
          "You’ll like this—it’s designed to feel premium.",
          {
            focusAudience: "Design-minded shoppers",
            priorities: ["materials", "fit", "finish"],
            featuredSegments: ["Creators"],
            tierPick: "high",
            heroTitle: "PulseRing Titanium builds that read expensive.",
            summary: "Style messaging.",
          }
        ),
    },
    // 16 Non-techy
    {
      m: (s) => (s.includes("not very good with tech") || s.includes("not good with tech")) && !s.includes("gift"),
      r: () =>
        pack(
          "pulsering",
          "No worries—this is simple and easy to use.",
          {
            focusAudience: "Low-tech shoppers",
            priorities: ["ease", "clarity"],
            featuredSegments: ["Older adults"],
            tierPick: "low",
            heroTitle: "PulseRing keeps setup friendly.",
            summary: "Simplicity messaging.",
          }
        ),
    },
    // 18 Time management
    {
      m: (s) => s.includes("managing my time"),
      r: () =>
        pack(
          "pulsewatch",
          "That’s common—this helps you stay on schedule.",
          {
            focusAudience: "Scheduling-focused users",
            priorities: ["time blocking", "alerts"],
            featuredSegments: ["Professionals"],
            tierPick: "mid",
            heroTitle: "PulseWatch blocks time thoughtfully.",
            summary: "Time management messaging.",
          }
        ),
    },
    // 19 Habit building
    {
      m: (s) => s.includes("better habits") || (s.includes("habit") && s.includes("build")),
      r: () =>
        pack(
          "pulsering",
          "Great goal. This helps you stay consistent.",
          {
            focusAudience: "Routine builders",
            priorities: ["streaks", "reminders", "recovery"],
            featuredSegments: ["Students", "Professionals"],
            heroTitle: "PulseRing nudges streaks responsibly.",
            summary: "Habit messaging.",
          }
        ),
    },
    // 31 Notifications pain
    {
      m: (s) => s.includes("miss notifications"),
      r: () =>
        pack(
          "pulsewatch",
          "Got it. This keeps updates visible.",
          {
            focusAudience: "Heavy communicators",
            priorities: ["alerts", "priority inbox"],
            featuredSegments: ["Professionals"],
            tierPick: "mid",
            heroTitle: "PulseWatch surfaces urgent pings first.",
            summary: "Notification visibility messaging.",
          }
        ),
    },
    // 32 Control confidence
    {
      m: (s) => s.includes("in control"),
      r: () =>
        pack(
          "pulsewatch",
          "Great goal—this helps you stay organized.",
          {
            focusAudience: "Control seekers",
            priorities: ["agenda", "focus"],
            featuredSegments: ["Professionals"],
            heroTitle: "PulseWatch gives clearer command of the day.",
            summary: "Control / organizing messaging.",
          }
        ),
    },
    // 35 Skeptical smartwatch
    {
      m: (s) => s.includes("don't think i need") && s.includes("smartwatch"),
      r: () =>
        pack(
          "pulsering",
          "That’s fair—this is useful if you want quicker access without your phone.",
          {
            focusAudience: "Skeptical upgraders",
            priorities: ["value", "minimal"],
            featuredSegments: ["Professionals"],
            tierPick: "low",
            heroTitle: "PulseRing answers “why wear anything?” politely.",
            summary: "Soft value messaging.",
          }
        ),
    },
    // 36 Value-focused
    {
      m: (s) => (s.includes("worth the money") || s.includes("worth it")) && !s.includes("gift"),
      r: () =>
        pack(
          "pulsering",
          "Makes sense—this combines multiple useful features.",
          {
            focusAudience: "Value shoppers",
            priorities: ["value", "longevity"],
            featuredSegments: ["Professionals"],
            tierPick: "mid",
            heroTitle: "PulseRing bundles health metrics without waste.",
            summary: "Value storyline.",
          }
        ),
    },
    // 37 Direct recommendation
    {
      m: (s) => (s.includes("which one") && s.includes("get")) || s.includes("should i get"),
      r: () =>
        pack(
          "pulsewatch",
          "I can help—let’s start with the best option for you.",
          {
            focusAudience: "Deciding shoppers",
            priorities: ["fit", "use case"],
            featuredSegments: ["Students", "Athletes"],
            tierPick: "mid",
            heroTitle: "We’ll funnel you to one winner soon.",
            summary: "Guided recommendation mode.",
          }
        ),
    },
    // 39 Gift buyer dad (avoid bare “gift” stealing other intents)
    {
      m: (s) =>
        (s.includes("buying") && (s.includes("dad") || s.includes("for my"))) ||
        /\bgift\b/i.test(s),
      r: () =>
        pack(
          "pulsering",
          "Nice—this is a practical and easy-to-use option.",
          {
            focusAudience: "Gift buyers",
            priorities: ["simplicity", "battery"],
            featuredSegments: ["Older adults"],
            tierPick: "mid",
            heroTitle: "PulseRing makes a calm gift.",
            summary: "Gift-ready / practical storyline.",
          }
        ),
    },
    // 20 Multitasker
    {
      m: (s) => s.includes("juggling a lot"),
      r: () =>
        pack(
          "pulsewatch",
          "This will help you keep everything organized.",
          {
            focusAudience: "Multitaskers",
            priorities: ["context switching"],
            featuredSegments: ["Professionals", "Creators"],
            heroTitle: "PulseWatch survives context swaps.",
            summary: "Multitasking messaging.",
          }
        ),
    },
    // 27 Forgetful reminders
    {
      m: (s) => s.includes("forget everything") || s.includes("unless i write"),
      r: () =>
        pack(
          "pulsewatch",
          "Got it. This helps you stay reminded.",
          {
            focusAudience: "Reminder reliant users",
            priorities: ["reminders", "checklists"],
            featuredSegments: ["Students", "Professionals"],
            heroTitle: "PulseWatch nudges you at the right time.",
            summary: "Reminder messaging.",
          }
        ),
    },
    // 26 Unsure — before generic just
    {
      m: (s) => s.includes("not sure what i want"),
      r: () =>
        pack(
          "pulsewatch",
          "No problem—I’ll show useful features first.",
          {
            focusAudience: "Explorers",
            priorities: ["overview", "education"],
            featuredSegments: ["Students", "Professionals"],
            tierPick: "mid",
            heroTitle: "Start neutral with PulseWatch as the baseline.",
            summary: "Default discovery messaging.",
          }
        ),
    },
    // 30 Ambiguous helpful
    {
      m: (s) => norm(s) === "just something useful",
      r: () =>
        pack(
          "pulsewatch",
          "Got it. I’ll show helpful features.",
          {
            focusAudience: "General shoppers",
            priorities: ["versatility"],
            featuredSegments: ["Professionals"],
            heroTitle: "General helpful toolkit on PulseWatch.",
            summary: "Default-ish helpful mode.",
          }
        ),
    },
    // 34 Very ambiguous
    {
      m: (s) => norm(s) === "just something helpful",
      r: () =>
        pack(
          "pulsewatch",
          "Got it. I’ll focus on simple features.",
          {
            focusAudience: "General shoppers",
            priorities: ["simplicity"],
            featuredSegments: ["Students"],
            heroTitle: "Clear, simple PulseWatch defaults.",
            summary: "Ultra-default helpful.",
          }
        ),
    },
    // 22 Vague improvement life — before ambiguous
    {
      m: (s) => norm(s).includes("improve my life"),
      r: () =>
        pack(
          "pulsewatch",
          "Got it. This helps you build better routines.",
          {
            focusAudience: "Broad improvers",
            priorities: ["routines", "balance"],
            featuredSegments: ["Professionals"],
            tierPick: "mid",
            heroTitle: "PulseWatch anchors daily routines lightly.",
            summary: "Balanced default messaging.",
          }
        ),
    },
    // 23–25 Single words — exact-ish
    {
      m: (s) => norm(s) === "fitness",
      r: () =>
        pack(
          "pulseband",
          "Got it. I’ll focus on fitness features.",
          {
            focusAudience: "Fitness newcomers",
            priorities: ["movement", "recovery"],
            featuredSegments: ["Athletes"],
            heroTitle: "PulseBand for Fitness.",
            summary: "Fitness-first.",
          }
        ),
    },
    {
      m: (s) => norm(s) === "school",
      r: () =>
        pack(
          "pulsewatch",
          "Got it. Let’s focus on staying organized.",
          {
            focusAudience: "Students",
            priorities: ["study"],
            featuredSegments: ["Students"],
            heroTitle: "Student rhythm on PulseWatch.",
            summary: "Student wording.",
          }
        ),
    },
    {
      m: (s) => norm(s) === "work",
      r: () =>
        pack(
          "pulsewatch",
          "Got it. I’ll focus on productivity.",
          {
            focusAudience: "Professionals",
            priorities: ["productivity"],
            featuredSegments: ["Professionals"],
            heroTitle: "Productivity overlays on PulseWatch.",
            summary: "Productivity emphasis.",
          }
        ),
    },
  ];

  for (const rule of rules) {
    try {
      if (rule.m(n)) {
        const out = rule.r();
        return { reply: out.reply, personalization: out.personalization };
      }
    } catch {
      /* continue */
    }
  }

  return null;
}
