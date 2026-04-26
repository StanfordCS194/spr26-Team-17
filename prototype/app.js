const products = [
  {
    id: "nike-run-division-top",
    name: "Nike Dri-FIT Run Division Top",
    brand: "Nike",
    category: "top",
    sport: "running",
    price: 48,
    rating: 4.6,
    colors: ["blue", "black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fit: "regular",
    environment: ["road", "warm"],
    features: ["breathable", "sweat-wicking", "reflective", "lightweight"],
    useCase: "tempo runs and warm-weather miles",
    visual: { upper: "#2f6fdd", accent: "#d6f264", sole: "#17181c", soft: "#dce8ff" },
    image: {
      src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "adidas-run-shorts",
    name: "Adidas Own the Run Shorts",
    brand: "Adidas",
    category: "shorts",
    sport: "running",
    price: 38,
    rating: 4.4,
    colors: ["black", "gray"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    fit: "relaxed",
    environment: ["road", "warm"],
    features: ["lightweight", "pockets", "sweat-wicking"],
    useCase: "daily runs when storage and airflow matter",
    visual: { upper: "#202326", accent: "#78d25b", sole: "#e7e9e1", soft: "#dff7d6" },
    image: {
      src: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "lululemon-energy-bra",
    name: "Lululemon Energy Bra High Support",
    brand: "Lululemon",
    category: "sports bra",
    sport: "training",
    price: 58,
    rating: 4.7,
    colors: ["red", "black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fit: "supportive",
    environment: ["gym", "studio"],
    features: ["high support", "supportive", "sweat-wicking", "stretchy"],
    useCase: "high-impact workouts and studio classes",
    visual: { upper: "#c52f62", accent: "#111217", sole: "#f7f4ea", soft: "#f7dada" },
    image: {
      src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "athleta-salutation-legging",
    name: "Athleta Salutation Stash Legging",
    brand: "Athleta",
    category: "leggings",
    sport: "yoga",
    price: 79,
    rating: 4.5,
    colors: ["navy", "gray"],
    sizes: ["XXS", "XS", "S", "M", "L", "XL"],
    fit: "compressive",
    environment: ["studio", "travel"],
    features: ["stretchy", "pockets", "sweat-wicking"],
    useCase: "yoga, pilates, and all-day comfort",
    visual: { upper: "#243e63", accent: "#8bc6ff", sole: "#f9faf4", soft: "#e1edf2" },
    image: {
      src: "https://images.unsplash.com/photo-1540206276207-3af25c08abc4?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "under-armour-compression-tee",
    name: "Under Armour HeatGear Compression Tee",
    brand: "Under Armour",
    category: "top",
    sport: "training",
    price: 35,
    rating: 4.3,
    colors: ["black", "white"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fit: "compressive",
    environment: ["gym", "warm"],
    features: ["compression", "sweat-wicking", "breathable"],
    useCase: "lifting, intervals, and layered training",
    visual: { upper: "#111217", accent: "#f8f8f4", sole: "#d6f264", soft: "#ecece7" },
    image: {
      src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "jordan-basketball-jersey",
    name: "Jordan Dri-FIT Basketball Jersey",
    brand: "Jordan",
    category: "jersey",
    sport: "basketball",
    price: 72,
    rating: 4.6,
    colors: ["red", "black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    fit: "relaxed",
    environment: ["court", "warm"],
    features: ["breathable", "lightweight", "sweat-wicking"],
    useCase: "pickup games and team practice",
    visual: { upper: "#c52f2f", accent: "#111217", sole: "#f7f4ea", soft: "#f7dada" },
    image: {
      src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "wilson-court-skort",
    name: "Wilson Court Stretch Skort",
    brand: "Wilson",
    category: "skirt",
    sport: "tennis",
    price: 64,
    rating: 4.5,
    colors: ["white", "green"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fit: "regular",
    environment: ["court", "warm"],
    features: ["stretchy", "pockets", "sweat-wicking", "breathable"],
    useCase: "tennis, pickleball, and warm court sessions",
    visual: { upper: "#fcfbf5", accent: "#26714d", sole: "#22252a", soft: "#e5f1e8" },
    image: {
      src: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "patagonia-houdini-jacket",
    name: "Patagonia Houdini Rain Jacket",
    brand: "Patagonia",
    category: "jacket",
    sport: "hiking",
    price: 109,
    rating: 4.8,
    colors: ["green", "blue"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fit: "regular",
    environment: ["trail", "rain"],
    features: ["waterproof", "packable", "windproof", "lightweight"],
    useCase: "trail layers for changing weather",
    visual: { upper: "#245f45", accent: "#d6f264", sole: "#111217", soft: "#dff4e7" },
    image: {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "north-face-fleece",
    name: "The North Face Summit Fleece",
    brand: "The North Face",
    category: "jacket",
    sport: "hiking",
    price: 95,
    rating: 4.4,
    colors: ["brown", "black"],
    sizes: ["S", "M", "L", "XL"],
    fit: "relaxed",
    environment: ["trail", "cold"],
    features: ["insulated", "durable", "warm"],
    useCase: "cold trail days and outdoor layering",
    visual: { upper: "#6d5036", accent: "#ff8a35", sole: "#161719", soft: "#f3e4d8" },
    image: {
      src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "speedo-training-jammer",
    name: "Speedo HydroPulse Training Jammer",
    brand: "Speedo",
    category: "swimwear",
    sport: "swimming",
    price: 46,
    rating: 4.2,
    colors: ["blue", "black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fit: "compressive",
    environment: ["pool", "warm"],
    features: ["quick-dry", "compression", "durable"],
    useCase: "lap swimming and swim team practice",
    visual: { upper: "#2e6dd6", accent: "#78d25b", sole: "#111217", soft: "#dce8ff" },
    image: {
      src: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "rapha-core-bib-shorts",
    name: "Rapha Core Cycling Bib Shorts",
    brand: "Rapha",
    category: "shorts",
    sport: "cycling",
    price: 122,
    rating: 4.7,
    colors: ["black", "navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fit: "compressive",
    environment: ["road", "warm"],
    features: ["cushioned", "breathable", "compression"],
    useCase: "long road rides and endurance training",
    visual: { upper: "#191b20", accent: "#ffffff", sole: "#d6f264", soft: "#edf2df" },
    image: {
      src: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "nike-soccer-cleats",
    name: "Nike Mercurial Soccer Cleats",
    brand: "Nike",
    category: "footwear",
    sport: "soccer",
    price: 92,
    rating: 4.8,
    colors: ["yellow", "black"],
    sizes: [7, 8, 9, 10, 10.5, 11, 12],
    fit: "secure",
    environment: ["field"],
    features: ["grippy", "lightweight", "responsive"],
    useCase: "firm-ground soccer matches",
    visual: { upper: "#f2cf47", accent: "#111217", sole: "#245f45", soft: "#fff4c7" },
    image: {
      src: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "brooks-ghost-road",
    name: "Brooks Ghost Road Running Shoes",
    brand: "Brooks",
    category: "footwear",
    sport: "running",
    price: 128,
    rating: 4.5,
    colors: ["white", "orange"],
    sizes: [7, 8, 9, 9.5, 10, 11, 12, 13],
    fit: "regular",
    environment: ["road"],
    features: ["cushioned", "breathable", "responsive"],
    useCase: "daily road running and walking",
    visual: { upper: "#faf9f2", accent: "#ff714f", sole: "#24272c", soft: "#ffe5dc" },
    image: {
      src: "https://img.runningwarehouse.com/watermark/rs.php?path=N41PM01-1.jpg&nw=700",
      source: "Running Warehouse"
    }
  },
  {
    id: "adidas-tiro-pants",
    name: "Adidas Tiro Training Pants",
    brand: "Adidas",
    category: "pants",
    sport: "soccer",
    price: 50,
    rating: 4.4,
    colors: ["black", "white"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    fit: "slim",
    environment: ["field", "gym"],
    features: ["sweat-wicking", "stretchy", "zippered pockets"],
    useCase: "soccer warmups and cool-weather training",
    visual: { upper: "#111217", accent: "#ffffff", sole: "#3077e8", soft: "#ecece7" },
    image: {
      src: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "vuori-performance-jogger",
    name: "Vuori Sunday Performance Jogger",
    brand: "Vuori",
    category: "pants",
    sport: "lifestyle",
    price: 89,
    rating: 4.6,
    colors: ["gray", "green"],
    sizes: ["XS", "S", "M", "L", "XL"],
    fit: "relaxed",
    environment: ["travel", "gym"],
    features: ["stretchy", "soft", "pockets"],
    useCase: "travel, errands, and light workouts",
    visual: { upper: "#cfd4d8", accent: "#245f45", sole: "#f9faf4", soft: "#eef1ec" },
    image: {
      src: "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  },
  {
    id: "gymshark-training-duffel",
    name: "Gymshark Training Duffel",
    brand: "Gymshark",
    category: "bag",
    sport: "training",
    price: 54,
    rating: 4.2,
    colors: ["black", "green"],
    sizes: ["One Size"],
    fit: "carry",
    environment: ["gym", "travel"],
    features: ["durable", "pockets", "water-resistant"],
    useCase: "gym commutes and weekend sports gear",
    visual: { upper: "#245f45", accent: "#f8f8f4", sole: "#111217", soft: "#dff4e7" },
    image: {
      src: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=900&q=80",
      source: "Unsplash"
    }
  }
];

const extraUniqueProductSpecs = [
  {
    id: "cadence-thermal-run-vest",
    name: "Cadence Thermal Run Vest",
    brand: "Tracksmith",
    category: "vest",
    sport: "running",
    price: 86,
    rating: 4.5,
    colors: ["navy", "orange"],
    fit: "regular",
    environment: ["road", "cold"],
    features: ["windproof", "reflective", "lightweight"],
    useCase: "cold morning runs when a full jacket is too much",
    palette: "navy"
  },
  {
    id: "dawn-merino-run-socks",
    name: "Dawn Merino Run Socks",
    brand: "Feetures",
    category: "socks",
    sport: "running",
    price: 18,
    rating: 4.6,
    colors: ["gray", "blue"],
    fit: "regular",
    environment: ["road", "cold"],
    features: ["soft", "breathable", "odor-resistant"],
    useCase: "daily runs with blister-conscious comfort",
    palette: "gray"
  },
  {
    id: "night-mile-reflective-cap",
    name: "Night Mile Reflective Cap",
    brand: "Ciele",
    category: "hat",
    sport: "running",
    price: 34,
    rating: 4.4,
    colors: ["yellow", "black"],
    fit: "adjustable",
    environment: ["road", "warm"],
    features: ["reflective", "breathable", "lightweight"],
    useCase: "sunny or low-light road runs",
    palette: "yellow"
  },
  {
    id: "studio-flow-crop-tank",
    name: "Studio Flow Crop Tank",
    brand: "Alo Yoga",
    category: "top",
    sport: "yoga",
    price: 42,
    rating: 4.3,
    colors: ["white", "green"],
    fit: "slim",
    environment: ["studio", "warm"],
    features: ["stretchy", "soft", "breathable"],
    useCase: "yoga, pilates, and studio classes",
    palette: "green"
  },
  {
    id: "sculpt-seamless-training-shorts",
    name: "Sculpt Seamless Training Shorts",
    brand: "Gymshark",
    category: "shorts",
    sport: "training",
    price: 36,
    rating: 4.2,
    colors: ["purple", "black"],
    fit: "compressive",
    environment: ["gym", "warm"],
    features: ["stretchy", "sweat-wicking", "compression"],
    useCase: "squats, conditioning, and high-movement gym days",
    palette: "purple"
  },
  {
    id: "grip-lifting-gloves",
    name: "Grip Lifting Gloves",
    brand: "Rogue",
    category: "gloves",
    sport: "training",
    price: 28,
    rating: 4.1,
    colors: ["black", "red"],
    fit: "secure",
    environment: ["gym"],
    features: ["grippy", "durable", "supportive"],
    useCase: "weight training and pull-focused workouts",
    palette: "red"
  },
  {
    id: "court-mesh-polo",
    name: "Court Mesh Polo",
    brand: "Lacoste",
    category: "top",
    sport: "tennis",
    price: 74,
    rating: 4.5,
    colors: ["white", "green"],
    fit: "regular",
    environment: ["court", "warm"],
    features: ["breathable", "sweat-wicking", "stretchy"],
    useCase: "tennis, pickleball, and club court play",
    palette: "white"
  },
  {
    id: "court-stability-shoes",
    name: "Court Stability Shoes",
    brand: "ASICS",
    category: "footwear",
    sport: "tennis",
    price: 118,
    rating: 4.7,
    colors: ["white", "blue"],
    sizes: [7, 8, 9, 9.5, 10, 11, 12, 13],
    fit: "supportive",
    environment: ["court"],
    features: ["supportive", "durable", "grippy"],
    useCase: "lateral movement on tennis and pickleball courts",
    palette: "blue"
  },
  {
    id: "pickleball-performance-skort",
    name: "Pickleball Performance Skort",
    brand: "EleVen",
    category: "skirt",
    sport: "tennis",
    price: 58,
    rating: 4.4,
    colors: ["blue", "white"],
    fit: "regular",
    environment: ["court", "warm"],
    features: ["pockets", "stretchy", "sweat-wicking"],
    useCase: "pickleball matches and warm court sessions",
    palette: "blue"
  },
  {
    id: "peloton-compression-calf-socks",
    name: "Compression Calf Socks",
    brand: "Peloton",
    category: "socks",
    sport: "cycling",
    price: 22,
    rating: 4.2,
    colors: ["black", "white"],
    fit: "compressive",
    environment: ["road", "warm"],
    features: ["compression", "breathable", "sweat-wicking"],
    useCase: "spin classes and road rides",
    palette: "black"
  },
  {
    id: "downhill-snow-shell",
    name: "Downhill Snow Shell",
    brand: "Arc'teryx",
    category: "jacket",
    sport: "skiing",
    price: 188,
    rating: 4.8,
    colors: ["red", "black"],
    fit: "regular",
    environment: ["snow", "cold"],
    features: ["waterproof", "windproof", "durable"],
    useCase: "snow days, skiing, and winter mountain weather",
    palette: "red"
  },
  {
    id: "powder-bib-pants",
    name: "Powder Bib Pants",
    brand: "Outdoor Research",
    category: "pants",
    sport: "skiing",
    price: 164,
    rating: 4.6,
    colors: ["green", "black"],
    fit: "regular",
    environment: ["snow", "cold"],
    features: ["waterproof", "insulated", "durable"],
    useCase: "skiing, snowboarding, and winter resort days",
    palette: "green"
  },
  {
    id: "thermal-snow-gloves",
    name: "Thermal Snow Gloves",
    brand: "Hestra",
    category: "gloves",
    sport: "skiing",
    price: 78,
    rating: 4.5,
    colors: ["black", "brown"],
    fit: "regular",
    environment: ["snow", "cold"],
    features: ["insulated", "waterproof", "grippy"],
    useCase: "cold-weather sports and snowy commutes",
    palette: "brown"
  },
  {
    id: "fairway-stretch-polo",
    name: "Fairway Stretch Polo",
    brand: "Peter Millar",
    category: "top",
    sport: "golf",
    price: 69,
    rating: 4.4,
    colors: ["blue", "white"],
    fit: "regular",
    environment: ["field", "warm"],
    features: ["stretchy", "breathable", "sweat-wicking"],
    useCase: "golf rounds and polished warm-weather training",
    palette: "blue"
  },
  {
    id: "golf-commuter-pants",
    name: "Golf Commuter Pants",
    brand: "Rhone",
    category: "pants",
    sport: "golf",
    price: 98,
    rating: 4.5,
    colors: ["gray", "navy"],
    fit: "slim",
    environment: ["field", "travel"],
    features: ["stretchy", "pockets", "water-resistant"],
    useCase: "golf rounds that go straight into the rest of the day",
    palette: "gray"
  },
  {
    id: "sun-range-golf-hat",
    name: "Sun Range Golf Hat",
    brand: "Titleist",
    category: "hat",
    sport: "golf",
    price: 32,
    rating: 4.3,
    colors: ["white", "navy"],
    fit: "adjustable",
    environment: ["field", "warm"],
    features: ["breathable", "lightweight", "sun protection"],
    useCase: "sunny range sessions and weekend rounds",
    palette: "white"
  },
  {
    id: "volleyball-knee-pads",
    name: "Volleyball Knee Pads",
    brand: "Mizuno",
    category: "accessory",
    sport: "volleyball",
    price: 30,
    rating: 4.6,
    colors: ["black", "white"],
    fit: "supportive",
    environment: ["indoor", "court"],
    features: ["cushioned", "supportive", "durable"],
    useCase: "indoor volleyball dives and defensive practice",
    palette: "black"
  },
  {
    id: "volleyball-practice-jersey",
    name: "Volleyball Practice Jersey",
    brand: "Mizuno",
    category: "jersey",
    sport: "volleyball",
    price: 46,
    rating: 4.2,
    colors: ["red", "white"],
    fit: "regular",
    environment: ["indoor", "court"],
    features: ["breathable", "sweat-wicking", "stretchy"],
    useCase: "team practice and indoor volleyball matches",
    palette: "red"
  },
  {
    id: "diamond-training-cap",
    name: "Diamond Training Cap",
    brand: "New Era",
    category: "hat",
    sport: "baseball",
    price: 30,
    rating: 4.4,
    colors: ["navy", "white"],
    fit: "adjustable",
    environment: ["field", "warm"],
    features: ["breathable", "durable", "sun protection"],
    useCase: "batting practice and sunny game days",
    palette: "navy"
  },
  {
    id: "baseball-training-pants",
    name: "Baseball Training Pants",
    brand: "Rawlings",
    category: "pants",
    sport: "baseball",
    price: 54,
    rating: 4.3,
    colors: ["gray", "white"],
    fit: "regular",
    environment: ["field"],
    features: ["durable", "stretchy", "pockets"],
    useCase: "baseball practice and dusty field work",
    palette: "gray"
  },
  {
    id: "dance-studio-leggings",
    name: "Dance Studio Leggings",
    brand: "Capezio",
    category: "leggings",
    sport: "dance",
    price: 52,
    rating: 4.4,
    colors: ["black", "purple"],
    fit: "compressive",
    environment: ["studio"],
    features: ["stretchy", "soft", "sweat-wicking"],
    useCase: "dance rehearsal, barre, and studio movement",
    palette: "purple"
  },
  {
    id: "dance-warmup-wrap-top",
    name: "Dance Warmup Wrap Top",
    brand: "Bloch",
    category: "top",
    sport: "dance",
    price: 44,
    rating: 4.2,
    colors: ["pink", "black"],
    fit: "slim",
    environment: ["studio", "cold"],
    features: ["soft", "stretchy", "warm"],
    useCase: "studio warmups and low-impact movement",
    palette: "pink"
  },
  {
    id: "trail-hydration-vest",
    name: "Trail Hydration Vest",
    brand: "Salomon",
    category: "vest",
    sport: "hiking",
    price: 118,
    rating: 4.7,
    colors: ["green", "black"],
    fit: "secure",
    environment: ["trail", "warm"],
    features: ["pockets", "lightweight", "breathable"],
    useCase: "long hikes, trail runs, and hands-free storage",
    palette: "green"
  },
  {
    id: "trail-crew-socks",
    name: "Trail Crew Socks",
    brand: "Darn Tough",
    category: "socks",
    sport: "hiking",
    price: 24,
    rating: 4.8,
    colors: ["brown", "orange"],
    fit: "regular",
    environment: ["trail", "cold"],
    features: ["durable", "soft", "breathable"],
    useCase: "hiking boots, long trails, and cool weather",
    palette: "brown"
  },
  {
    id: "beach-training-rash-guard",
    name: "Beach Training Rash Guard",
    brand: "O'Neill",
    category: "top",
    sport: "swimming",
    price: 49,
    rating: 4.3,
    colors: ["blue", "white"],
    fit: "slim",
    environment: ["pool", "warm"],
    features: ["quick-dry", "sun protection", "stretchy"],
    useCase: "open-water swim days and beach workouts",
    palette: "blue"
  },
  {
    id: "swim-deck-parka",
    name: "Swim Deck Parka",
    brand: "TYR",
    category: "jacket",
    sport: "swimming",
    price: 92,
    rating: 4.4,
    colors: ["navy", "red"],
    fit: "relaxed",
    environment: ["pool", "cold"],
    features: ["warm", "water-resistant", "durable"],
    useCase: "warmth before and after pool sessions",
    palette: "navy"
  },
  {
    id: "cycling-wind-vest",
    name: "Cycling Wind Vest",
    brand: "Castelli",
    category: "vest",
    sport: "cycling",
    price: 88,
    rating: 4.5,
    colors: ["yellow", "black"],
    fit: "slim",
    environment: ["road", "cold"],
    features: ["windproof", "packable", "reflective"],
    useCase: "road rides with shifting weather",
    palette: "yellow"
  },
  {
    id: "cycling-thermal-gloves",
    name: "Cycling Thermal Gloves",
    brand: "Giro",
    category: "gloves",
    sport: "cycling",
    price: 42,
    rating: 4.3,
    colors: ["black", "gray"],
    fit: "regular",
    environment: ["road", "cold"],
    features: ["warm", "grippy", "windproof"],
    useCase: "cool-weather rides and commuting",
    palette: "black"
  },
  {
    id: "soccer-shin-guards",
    name: "Soccer Shin Guards",
    brand: "Adidas",
    category: "accessory",
    sport: "soccer",
    price: 26,
    rating: 4.2,
    colors: ["white", "black"],
    fit: "secure",
    environment: ["field"],
    features: ["protective", "lightweight", "durable"],
    useCase: "field practices and weekend soccer matches",
    palette: "white"
  },
  {
    id: "soccer-training-jacket",
    name: "Soccer Training Jacket",
    brand: "Nike",
    category: "jacket",
    sport: "soccer",
    price: 76,
    rating: 4.4,
    colors: ["black", "green"],
    fit: "slim",
    environment: ["field", "cold"],
    features: ["water-resistant", "sweat-wicking", "zippered pockets"],
    useCase: "soccer warmups and cool-weather sideline layers",
    palette: "green"
  },
  {
    id: "basketball-shooting-sleeve",
    name: "Basketball Shooting Sleeve",
    brand: "McDavid",
    category: "accessory",
    sport: "basketball",
    price: 24,
    rating: 4.1,
    colors: ["black", "red"],
    fit: "compressive",
    environment: ["court", "indoor"],
    features: ["compression", "supportive", "sweat-wicking"],
    useCase: "pickup games, shooting drills, and arm support",
    palette: "red"
  },
  {
    id: "basketball-warmup-pants",
    name: "Basketball Warmup Pants",
    brand: "Jordan",
    category: "pants",
    sport: "basketball",
    price: 68,
    rating: 4.3,
    colors: ["black", "gray"],
    fit: "relaxed",
    environment: ["court", "cold"],
    features: ["warm", "pockets", "sweat-wicking"],
    useCase: "pre-game warmups and post-practice comfort",
    palette: "black"
  },
  {
    id: "lifestyle-fleece-hoodie",
    name: "Lifestyle Fleece Hoodie",
    brand: "Vuori",
    category: "jacket",
    sport: "lifestyle",
    price: 84,
    rating: 4.6,
    colors: ["gray", "blue"],
    fit: "relaxed",
    environment: ["travel", "cold"],
    features: ["soft", "warm", "pockets"],
    useCase: "travel, errands, and casual recovery days",
    palette: "gray"
  },
  {
    id: "travel-waist-pack",
    name: "Travel Waist Pack",
    brand: "JanSport",
    category: "bag",
    sport: "lifestyle",
    price: 32,
    rating: 4.1,
    colors: ["green", "black"],
    fit: "carry",
    environment: ["travel", "warm"],
    features: ["pockets", "water-resistant", "lightweight"],
    useCase: "hands-free storage for walks, travel, and events",
    palette: "green"
  },
  {
    id: "recovery-slide-sandals",
    name: "Recovery Slide Sandals",
    brand: "OOFOS",
    category: "footwear",
    sport: "lifestyle",
    price: 58,
    rating: 4.5,
    colors: ["black", "blue"],
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    fit: "regular",
    environment: ["travel", "warm"],
    features: ["cushioned", "soft", "water-resistant"],
    useCase: "recovery days, locker rooms, and casual walking",
    palette: "blue"
  }
];

const visualThemes = {
  black: { upper: "#111217", accent: "#ffffff", sole: "#d6f264", soft: "#ecece7" },
  blue: { upper: "#2f6fdd", accent: "#d6f264", sole: "#17181c", soft: "#dce8ff" },
  brown: { upper: "#6d5036", accent: "#ff8a35", sole: "#161719", soft: "#f3e4d8" },
  gray: { upper: "#cfd4d8", accent: "#243e63", sole: "#f9faf4", soft: "#eef1ec" },
  green: { upper: "#245f45", accent: "#d6f264", sole: "#111217", soft: "#dff4e7" },
  navy: { upper: "#243e63", accent: "#8bc6ff", sole: "#f9faf4", soft: "#e1edf2" },
  orange: { upper: "#ff714f", accent: "#111217", sole: "#24272c", soft: "#ffe5dc" },
  pink: { upper: "#c85d86", accent: "#f7f4ea", sole: "#111217", soft: "#f8ddea" },
  purple: { upper: "#6b4bb8", accent: "#d6f264", sole: "#17181c", soft: "#eee7ff" },
  red: { upper: "#c52f2f", accent: "#111217", sole: "#f7f4ea", soft: "#f7dada" },
  white: { upper: "#fcfbf5", accent: "#26714d", sole: "#22252a", soft: "#e5f1e8" },
  yellow: { upper: "#f2cf47", accent: "#111217", sole: "#245f45", soft: "#fff4c7" }
};

const sizeSets = {
  apparel: ["XS", "S", "M", "L", "XL"],
  extended: ["XS", "S", "M", "L", "XL", "XXL"],
  footwear: [6, 7, 8, 9, 10, 11, 12, 13],
  accessory: ["One Size"],
  gloves: ["S", "M", "L", "XL"],
  socks: ["S", "M", "L", "XL"]
};

const dummyTemplates = [
  {
    id: "run-tee",
    name: "Run Tee",
    category: "top",
    sport: "running",
    price: 26,
    colors: ["blue", "black"],
    fit: "regular",
    environment: ["road", "warm"],
    features: ["breathable", "sweat-wicking", "lightweight"],
    useCase: "basic warm-weather running and walking",
    palette: "blue"
  },
  {
    id: "training-shorts",
    name: "Training Shorts",
    category: "shorts",
    sport: "training",
    price: 30,
    colors: ["black", "gray"],
    fit: "relaxed",
    environment: ["gym", "warm"],
    features: ["stretchy", "pockets", "sweat-wicking"],
    useCase: "general workouts and gym sessions",
    palette: "black"
  },
  {
    id: "studio-leggings",
    name: "Studio Leggings",
    category: "leggings",
    sport: "yoga",
    price: 44,
    colors: ["purple", "black"],
    fit: "compressive",
    environment: ["studio"],
    features: ["stretchy", "soft", "sweat-wicking"],
    useCase: "yoga, pilates, and light training",
    palette: "purple"
  },
  {
    id: "support-bra",
    name: "Support Sports Bra",
    category: "sports bra",
    sport: "training",
    price: 34,
    colors: ["red", "black"],
    fit: "supportive",
    environment: ["gym", "studio"],
    features: ["supportive", "sweat-wicking", "stretchy"],
    useCase: "studio classes and moderate-impact workouts",
    palette: "red"
  },
  {
    id: "resistance-band-set",
    name: "Resistance Band Set",
    category: "resistance band",
    sport: "training",
    price: 22,
    colors: ["green", "black"],
    fit: "carry",
    environment: ["gym", "travel"],
    features: ["lightweight", "portable", "durable"],
    useCase: "home workouts, activation drills, and travel training",
    palette: "green"
  },
  {
    id: "tennis-racket",
    name: "Tennis Racket",
    category: "racket",
    sport: "tennis",
    price: 72,
    colors: ["blue", "white"],
    fit: "carry",
    environment: ["court"],
    features: ["lightweight", "responsive", "grippy"],
    useCase: "tennis lessons, practice rallies, and weekend matches",
    palette: "blue"
  },
  {
    id: "training-cap",
    name: "Training Cap",
    category: "hat",
    sport: "running",
    price: 24,
    colors: ["white", "navy"],
    fit: "adjustable",
    environment: ["road", "warm"],
    features: ["breathable", "lightweight", "sun protection"],
    useCase: "sun protection for runs, practices, and outdoor workouts",
    palette: "white"
  },
  {
    id: "yoga-mat",
    name: "Yoga Mat",
    category: "mat",
    sport: "yoga",
    price: 32,
    colors: ["purple", "black"],
    fit: "carry",
    environment: ["studio", "travel"],
    features: ["grippy", "cushioned", "portable"],
    useCase: "yoga, pilates, stretching, and floor work",
    palette: "purple"
  },
  {
    id: "water-bottle",
    name: "Insulated Water Bottle",
    category: "bottle",
    sport: "lifestyle",
    price: 28,
    colors: ["blue", "black"],
    fit: "carry",
    environment: ["gym", "travel"],
    features: ["durable", "portable", "insulated"],
    useCase: "hydration for workouts, commutes, and game days",
    palette: "blue"
  },
  {
    id: "trail-shell",
    name: "Trail Shell",
    category: "jacket",
    sport: "hiking",
    price: 68,
    colors: ["green", "black"],
    fit: "regular",
    environment: ["trail", "rain"],
    features: ["water-resistant", "packable", "windproof"],
    useCase: "light rain and changing trail weather",
    palette: "green"
  },
  {
    id: "swim-jammer",
    name: "Swim Jammer",
    category: "swimwear",
    sport: "swimming",
    price: 32,
    colors: ["blue", "black"],
    fit: "compressive",
    environment: ["pool", "warm"],
    features: ["quick-dry", "durable", "compression"],
    useCase: "lap swimming and pool practice",
    palette: "blue"
  },
  {
    id: "cycling-jersey",
    name: "Cycling Jersey",
    category: "jersey",
    sport: "cycling",
    price: 52,
    colors: ["yellow", "black"],
    fit: "slim",
    environment: ["road", "warm"],
    features: ["breathable", "sweat-wicking", "pockets"],
    useCase: "road rides and spin training",
    palette: "yellow"
  },
  {
    id: "field-cleats",
    name: "Field Cleats",
    category: "footwear",
    sport: "soccer",
    price: 62,
    colors: ["white", "green"],
    fit: "secure",
    environment: ["field"],
    features: ["grippy", "lightweight", "durable"],
    useCase: "field practices and casual matches",
    palette: "white"
  },
  {
    id: "warmup-pants",
    name: "Warmup Pants",
    category: "pants",
    sport: "basketball",
    price: 48,
    colors: ["gray", "black"],
    fit: "relaxed",
    environment: ["court", "cold"],
    features: ["warm", "pockets", "sweat-wicking"],
    useCase: "warmups, cooldowns, and team travel",
    palette: "gray"
  },
  {
    id: "gym-duffel",
    name: "Gym Duffel",
    category: "bag",
    sport: "training",
    price: 38,
    colors: ["black", "green"],
    fit: "carry",
    environment: ["gym", "travel"],
    features: ["pockets", "durable", "water-resistant"],
    useCase: "carrying shoes, layers, and workout gear",
    palette: "green"
  }
];

const dummyModifiers = [
  { name: "Core", brand: "Stride Basic", priceDelta: 0, ratingDelta: 0 },
  { name: "Lite", brand: "Motion Supply", priceDelta: -4, ratingDelta: 0.1 },
  { name: "Everyday", brand: "Field House", priceDelta: 5, ratingDelta: 0.2 },
  { name: "Reserve", brand: "Interval Goods", priceDelta: 9, ratingDelta: 0.3 },
  { name: "Sample", brand: "Prototype Supply", priceDelta: -7, ratingDelta: -0.1 }
];

function sizesForCategory(category) {
  if (category === "footwear") return sizeSets.footwear;
  if (category === "gloves") return sizeSets.gloves;
  if (category === "socks") return sizeSets.socks;
  if (["bag", "hat", "accessory", "racket", "resistance band", "mat", "bottle", "ball", "helmet"].includes(category)) return sizeSets.accessory;
  if (["pants", "jacket", "top", "shorts", "jersey"].includes(category)) return sizeSets.extended;
  return sizeSets.apparel;
}

function visualFor(spec) {
  const palette = spec.palette || spec.colors?.[0] || "blue";
  return visualThemes[palette] || visualThemes.blue;
}

function makeGeneratedProduct(spec) {
  return {
    ...spec,
    sizes: spec.sizes || sizesForCategory(spec.category),
    visual: spec.visual || visualFor(spec)
  };
}

function withItemVisual(product) {
  return {
    ...product,
    sourceType: product.sourceType || "unique"
  };
}

function buildDummyProducts(count) {
  return Array.from({ length: count }, (_, index) => {
    const template = dummyTemplates[index % dummyTemplates.length];
    const modifier = dummyModifiers[Math.floor(index / dummyTemplates.length) % dummyModifiers.length];
    const rating = Math.min(4.8, Math.max(3.7, template.rating || 4.0) + modifier.ratingDelta + ((index % 3) * 0.05));
    const product = makeGeneratedProduct({
      ...template,
      id: `dummy-${String(index + 1).padStart(2, "0")}-${template.id}`,
      name: `${modifier.name} ${template.name}`,
      brand: modifier.brand,
      price: Math.max(12, template.price + modifier.priceDelta),
      rating: Number(rating.toFixed(1)),
      sourceType: "dummy"
    });

    return withItemVisual(product);
  });
}

function interleaveProducts(primary, secondary) {
  const mixed = [];
  const longest = Math.max(primary.length, secondary.length);

  for (let index = 0; index < longest; index += 1) {
    if (primary[index]) mixed.push(primary[index]);
    if (secondary[index]) mixed.push(secondary[index]);
  }

  return mixed;
}

const expandedUniqueProducts = [
  ...products,
  ...extraUniqueProductSpecs.map((spec) => makeGeneratedProduct(spec))
].slice(0, 50).map((product) => withItemVisual(product));
const dummyProducts = buildDummyProducts(50);
products.splice(0, products.length, ...interleaveProducts(expandedUniqueProducts, dummyProducts));

const sportAliases = {
  running: ["running", "runner", "jogging", "road run", "marathon"],
  yoga: ["yoga", "pilates", "barre"],
  basketball: ["basketball", "hoop", "hoops"],
  training: ["training", "trainer", "gym", "workout", "lifting"],
  soccer: ["soccer", "football", "cleats"],
  tennis: ["tennis", "pickleball", "racket", "court"],
  hiking: ["hiking", "hike", "trail", "outdoor"],
  swimming: ["swimming", "swim", "pool", "lap swim"],
  cycling: ["cycling", "bike", "biking", "riding"],
  lifestyle: ["casual", "lifestyle", "street", "everyday", "walking", "travel"],
  skiing: ["skiing", "ski", "snowboarding", "snowboard", "snow"],
  golf: ["golf", "fairway", "range"],
  volleyball: ["volleyball"],
  baseball: ["baseball", "softball"],
  dance: ["dance", "rehearsal"]
};

const categoryAliases = {
  top: ["top", "shirt", "tee", "t-shirt", "tank", "long sleeve", "base layer"],
  shorts: ["shorts", "short"],
  leggings: ["leggings", "legging", "tights"],
  "sports bra": ["sports bra", "bra", "high support"],
  jersey: ["jersey", "uniform"],
  skirt: ["skirt", "skort", "tennis skirt"],
  jacket: ["jacket", "shell", "rain jacket", "hoodie", "fleece", "coat", "outerwear"],
  vest: ["vest", "hydration vest"],
  swimwear: ["swimwear", "swimsuit", "jammer", "swim trunks"],
  footwear: ["shoes", "shoe", "sneakers", "sneaker", "cleats", "footwear"],
  pants: ["pants", "joggers", "jogger", "sweatpants", "warmups"],
  bag: ["bag", "duffel", "backpack", "pack"],
  socks: ["socks", "sock"],
  hat: ["hat", "cap", "visor"],
  gloves: ["gloves", "glove"],
  racket: ["racket", "racquet", "tennis racket"],
  "resistance band": ["resistance band", "resistance bands", "exercise bands", "bands"],
  mat: ["mat", "yoga mat"],
  bottle: ["bottle", "water bottle"],
  ball: ["ball", "basketball", "soccer ball", "volleyball"],
  helmet: ["helmet"],
  accessory: ["accessory", "knee pads", "shin guards", "sleeve"]
};

const brandAliases = [
  "nike", "adidas", "lululemon", "athleta", "under armour", "jordan", "wilson", "patagonia",
  "the north face", "speedo", "rapha", "brooks", "vuori", "gymshark", "tracksmith", "feetures",
  "ciele", "alo yoga", "rogue", "lacoste", "asics", "eleven", "peloton", "arc'teryx",
  "outdoor research", "hestra", "peter millar", "rhone", "titleist", "mizuno", "new era",
  "rawlings", "capezio", "bloch", "salomon", "o'neill", "tyr", "castelli", "giro", "mcdavid",
  "jansport", "oofos", "stride basic", "motion supply", "field house", "interval goods", "prototype supply"
];
const colorAliases = ["white", "black", "blue", "green", "red", "gray", "grey", "navy", "orange", "yellow", "brown", "purple", "pink"];
const featureAliases = {
  lightweight: ["lightweight", "light", "fast"],
  cushioned: ["cushion", "cushioned", "comfortable", "comfort"],
  soft: ["soft", "cozy"],
  supportive: ["support", "supportive"],
  "high support": ["high support", "maximum support"],
  compression: ["compression", "compressive", "tight"],
  durable: ["durable", "durability", "last long", "tough"],
  breathable: ["breathable", "breathability", "cool", "ventilated"],
  waterproof: ["waterproof", "rain", "wet"],
  "water-resistant": ["water resistant", "water-resistant"],
  "sweat-wicking": ["sweat wicking", "sweat-wicking", "moisture", "dri-fit", "dry fit"],
  "quick-dry": ["quick dry", "quick-dry", "dries fast"],
  reflective: ["reflective", "visibility", "night"],
  insulated: ["insulated", "warm", "winter"],
  warm: ["warm", "thermal"],
  windproof: ["windproof", "wind"],
  packable: ["packable", "packs down"],
  stretchy: ["stretchy", "stretch", "flexible"],
  pockets: ["pocket", "pockets", "storage"],
  grippy: ["grip", "grippy", "traction"],
  responsive: ["responsive", "springy"],
  "odor-resistant": ["odor resistant", "odor-resistant", "anti odor"],
  "sun protection": ["sun protection", "sun", "upf"],
  protective: ["protective", "protection", "pads", "guards"],
  "zippered pockets": ["zippered pockets", "zip pockets", "zipper pockets"]
};

const environmentAliases = {
  road: ["road", "pavement", "sidewalk"],
  trail: ["trail", "hiking", "outdoor", "mountain"],
  gym: ["gym", "training", "lifting", "workout"],
  studio: ["studio", "yoga", "pilates", "barre"],
  court: ["court", "basketball", "tennis", "pickleball"],
  field: ["field", "soccer", "football", "grass", "turf"],
  pool: ["pool", "swim", "swimming", "water"],
  snow: ["snow", "ski", "skiing", "snowboard", "snowboarding"],
  indoor: ["indoor", "inside"],
  cold: ["cold", "winter", "chilly"],
  rain: ["rain", "wet", "waterproof"],
  warm: ["warm", "hot", "summer", "heat"],
  travel: ["travel", "commute", "errands", "everyday"]
};

const emptyFilters = {
  sport: null,
  category: null,
  brand: null,
  color: null,
  maxPrice: null,
  size: null,
  fit: null,
  environment: null,
  features: []
};

const state = {
  filters: { ...emptyFilters },
  sort: "recommended",
  view: "recommended",
  cart: 0,
  compareIds: [],
  lastMatchedIds: products.map((product) => product.id),
  lastExactCount: products.length
};

const elements = {
  catalogueTitle: document.querySelector("#catalogueTitle"),
  intentLabel: document.querySelector("#intentLabel"),
  resultCount: document.querySelector("#resultCount"),
  productGrid: document.querySelector("#productGrid"),
  filterStrip: document.querySelector("#filterStrip"),
  shoppingBrief: document.querySelector("#shoppingBrief"),
  chatMessages: document.querySelector("#chatMessages"),
  chatForm: document.querySelector("#chatForm"),
  chatInput: document.querySelector("#chatInput"),
  sortSelect: document.querySelector("#sortSelect"),
  resetButton: document.querySelector("#resetButton"),
  cartCount: document.querySelector("#cartCount"),
  comparePanel: document.querySelector("#comparePanel")
};

function normalize(text) {
  return text.toLowerCase().replace(/[^\w\s.$'-]/g, " ").replace(/\s+/g, " ").trim();
}

function titleCase(text) {
  return text
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function currency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function displayCategory(category) {
  const labels = {
    top: "Tops",
    shorts: "Shorts",
    leggings: "Leggings",
    "sports bra": "Sports Bras",
    jersey: "Jerseys",
    skirt: "Skirts",
    jacket: "Outerwear",
    vest: "Vests",
    swimwear: "Swimwear",
    footwear: "Footwear",
    pants: "Pants",
    bag: "Bags",
    socks: "Socks",
    hat: "Hats",
    gloves: "Gloves",
    racket: "Rackets",
    "resistance band": "Resistance Bands",
    mat: "Mats",
    bottle: "Bottles",
    ball: "Balls",
    helmet: "Helmets",
    accessory: "Accessories"
  };

  return labels[category] || titleCase(category);
}

function normalizeSize(value) {
  const size = String(value).toLowerCase().replace(/\./g, "").trim();
  const aliases = {
    "extra small": "XS",
    small: "S",
    medium: "M",
    large: "L",
    "extra large": "XL",
    "double extra large": "XXL",
    "2xl": "XXL",
    "one size": "One Size",
    os: "One Size"
  };

  return aliases[size] || size.toUpperCase();
}

function productHasSize(product, size) {
  const requested = normalizeSize(size);
  return product.sizes.some((productSize) => normalizeSize(productSize) === requested);
}

function formatSizes(sizes) {
  if (sizes.length === 1) return String(sizes[0]);
  if (sizes.every((size) => typeof size === "number")) {
    return `${sizes[0]}-${sizes[sizes.length - 1]}`;
  }

  const order = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
  const normalized = sizes.map(normalizeSize);
  const ordered = normalized.filter((size) => order.includes(size)).sort((a, b) => order.indexOf(a) - order.indexOf(b));

  if (ordered.length === normalized.length && ordered.length > 2) {
    return `${ordered[0]}-${ordered[ordered.length - 1]}`;
  }

  return normalized.join(", ");
}

function productImagePath(product) {
  return `assets/search-images/${product.id}.jpg`;
}

function formatEnvironments(environments) {
  return environments.map(titleCase).join(", ");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function includesAny(text, aliases) {
  return aliases.some((alias) => text.includes(alias));
}

function getActiveFilters() {
  const filters = [];
  const { sport, category, brand, color, maxPrice, size, fit, environment, features } = state.filters;

  if (sport) filters.push({ key: "sport", label: titleCase(sport) });
  if (category) filters.push({ key: "category", label: displayCategory(category) });
  if (brand) filters.push({ key: "brand", label: brand });
  if (color) filters.push({ key: "color", label: titleCase(color) });
  if (maxPrice) filters.push({ key: "maxPrice", label: `Under ${currency(maxPrice)}` });
  if (size) filters.push({ key: "size", label: `Size ${size}` });
  if (fit) filters.push({ key: "fit", label: titleCase(fit) });
  if (environment) filters.push({ key: "environment", label: titleCase(environment) });
  features.forEach((feature) => filters.push({ key: `feature:${feature}`, label: titleCase(feature) }));

  return filters;
}

function productScore(product) {
  let score = product.rating * 10;
  const filters = state.filters;

  if (filters.sport && product.sport === filters.sport) score += 32;
  if (filters.category && product.category === filters.category) score += 24;
  if (filters.brand && product.brand.toLowerCase() === filters.brand.toLowerCase()) score += 18;
  if (filters.color && product.colors.includes(filters.color)) score += 12;
  if (filters.maxPrice && product.price <= filters.maxPrice) score += 10;
  if (filters.size && productHasSize(product, filters.size)) score += 8;
  if (filters.fit && product.fit === filters.fit) score += 8;
  if (filters.environment && product.environment.includes(filters.environment)) score += 8;
  score += filters.features.filter((feature) => product.features.includes(feature)).length * 9;

  if (state.view === "performance") score += product.features.length * 2;
  if (state.view === "price") score -= product.price / 10;

  return score;
}

function productMatches(product) {
  const { sport, category, brand, color, maxPrice, size, fit, environment, features } = state.filters;

  if (sport && product.sport !== sport) return false;
  if (category && product.category !== category) return false;
  if (brand && product.brand.toLowerCase() !== brand.toLowerCase()) return false;
  if (color && !product.colors.includes(color)) return false;
  if (maxPrice && product.price > maxPrice) return false;
  if (size && !productHasSize(product, size)) return false;
  if (fit && product.fit !== fit) return false;
  if (environment && !product.environment.includes(environment)) return false;
  if (features.length && !features.every((feature) => product.features.includes(feature))) return false;

  return true;
}

function getFilteredProducts() {
  const exact = products.filter(productMatches);
  state.lastExactCount = exact.length;
  const base = exact.length ? exact : products.filter((product) => {
    const { sport, category, brand, maxPrice } = state.filters;
    if (sport && product.sport !== sport) return false;
    if (category && product.category !== category) return false;
    if (brand && product.brand.toLowerCase() !== brand.toLowerCase()) return false;
    if (maxPrice && product.price > maxPrice + 30) return false;
    return true;
  });

  const sorted = [...base].sort((a, b) => {
    if (state.sort === "low") return a.price - b.price;
    if (state.sort === "high") return b.price - a.price;
    if (state.sort === "rating") return b.rating - a.rating;
    return productScore(b) - productScore(a);
  });

  state.lastMatchedIds = sorted.map((product) => product.id);
  return sorted;
}

function parseIntent(rawText) {
  const text = normalize(rawText);
  const updates = {};
  const addedFeatures = [];
  const actions = [];
  const notes = [];

  if (!text) return { updates, addedFeatures, actions, notes };

  if (includesAny(text, ["reset", "clear", "start over", "show all", "all gear", "all products", "all sportswear"])) {
    actions.push("reset");
    return { updates, addedFeatures, actions, notes: ["Reset to the full catalogue."] };
  }

  if (includesAny(text, ["compare", "versus", "vs"])) {
    actions.push("compare");
  }

  Object.entries(sportAliases).forEach(([sport, aliases]) => {
    if (includesAny(text, aliases)) updates.sport = sport;
  });

  Object.entries(categoryAliases).forEach(([category, aliases]) => {
    if (includesAny(text, aliases)) updates.category = category;
  });

  brandAliases.forEach((brand) => {
    if (text.includes(brand)) updates.brand = titleCase(brand);
  });

  colorAliases.forEach((color) => {
    if (text.includes(color)) updates.color = color === "grey" ? "gray" : color;
  });

  Object.entries(featureAliases).forEach(([feature, aliases]) => {
    if (includesAny(text, aliases)) addedFeatures.push(feature);
  });

  Object.entries(environmentAliases).forEach(([environment, aliases]) => {
    if (includesAny(text, aliases)) updates.environment = environment;
  });

  if (includesAny(text, ["compression fit", "compressive", "tight fit", "tight"])) updates.fit = "compressive";
  if (includesAny(text, ["relaxed fit", "loose", "roomy"])) updates.fit = "relaxed";
  if (includesAny(text, ["slim fit", "slim", "tapered"])) updates.fit = "slim";
  if (includesAny(text, ["regular fit", "standard fit"])) updates.fit = "regular";
  if (includesAny(text, ["supportive fit", "supportive"])) updates.fit = "supportive";

  const underMatch = text.match(/(?:under|below|less than|up to|max|maximum)\s*\$?\s*(\d{2,4})/);
  const aroundMatch = text.match(/(?:around|about|near|budget|for)\s*\$?\s*(\d{2,4})/);
  const dollarMatch = text.match(/\$\s*(\d{2,4})/);

  if (underMatch) {
    updates.maxPrice = Number(underMatch[1]);
  } else if (aroundMatch) {
    updates.maxPrice = Math.round(Number(aroundMatch[1]) * 1.15);
    notes.push(`I treated "around ${currency(Number(aroundMatch[1]))}" as a flexible ceiling.`);
  } else if (dollarMatch) {
    updates.maxPrice = Number(dollarMatch[1]);
  }

  const numericSizeMatch = text.match(/size\s*(\d{1,2}(?:\.\d)?)/) || text.match(/\b(\d{1,2}(?:\.\d)?)\s*(?:mens|men's|womens|women's)\b/);
  const letterSizeMatch = text.match(/(?:size\s*)?\b(xxs|xs|small|medium|large|xl|xxl|2xl|extra small|extra large|one size)\b/);
  const singleLetterSizeMatch = text.match(/\bsize\s*(s|m|l)\b/);

  if (numericSizeMatch) {
    updates.size = Number(numericSizeMatch[1]);
  } else if (letterSizeMatch) {
    updates.size = normalizeSize(letterSizeMatch[1]);
  } else if (singleLetterSizeMatch) {
    updates.size = normalizeSize(singleLetterSizeMatch[1]);
  }

  if (includesAny(text, ["cheap", "cheapest", "lowest price", "low price"])) actions.push("sortLow");
  if (includesAny(text, ["premium", "highest price", "expensive"])) actions.push("sortHigh");
  if (includesAny(text, ["top rated", "best rated"])) actions.push("sortRating");

  return { updates, addedFeatures, actions, notes };
}

function applyIntent(intent) {
  if (intent.actions.includes("reset")) {
    resetState();
    return;
  }

  state.filters = {
    ...state.filters,
    ...intent.updates,
    features: [...new Set([...state.filters.features, ...intent.addedFeatures])]
  };

  if (intent.actions.includes("sortLow")) state.sort = "low";
  if (intent.actions.includes("sortHigh")) state.sort = "high";
  if (intent.actions.includes("sortRating")) state.sort = "rating";
  elements.sortSelect.value = state.sort;

  if (Object.keys(intent.updates).length || intent.addedFeatures.length) state.compareIds = [];
}

function resetState() {
  state.filters = { ...emptyFilters, features: [] };
  state.sort = "recommended";
  state.view = "recommended";
  state.compareIds = [];
  elements.sortSelect.value = state.sort;
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === state.view));
}

function buildReply(rawText, intent, matches) {
  if (intent.actions.includes("reset")) return "Back to the full sportswear wall.";

  if (intent.actions.includes("compare")) {
    return matches.length >= 2
      ? `I pulled the first two matches into a comparison: ${matches[0].name} and ${matches[1].name}.`
      : "I need at least two matching products before I can compare them.";
  }

  const active = getActiveFilters().map((item) => item.label);
  const exactLine = state.lastExactCount
    ? `${matches.length} match${matches.length === 1 ? "" : "es"} now fit the request.`
    : "I could not find an exact match, so I relaxed the strictest parts and kept the closest options visible.";

  const nextQuestion = !state.filters.category
    ? "A product type would sharpen this: top, leggings, jacket, skirt, shoes, swimwear, or bag."
    : !state.filters.maxPrice
      ? "A budget would help me tighten the list."
      : !state.filters.size
        ? "Add a size if you want only items that fit you."
        : "You can ask me to compare, sort by price, or narrow by color, fit, or activity.";

  const notes = intent.notes.length ? ` ${intent.notes.join(" ")}` : "";
  return `${exactLine}${notes} ${active.length ? `Active filters: ${active.join(", ")}.` : ""} ${nextQuestion}`;
}

function getCatalogueTitle() {
  const { sport, category, brand, color, maxPrice, fit, environment } = state.filters;
  const parts = [];

  if (color) parts.push(titleCase(color));
  if (brand) parts.push(brand);
  if (sport && category) parts.push(`${titleCase(sport)} ${displayCategory(category)}`);
  else if (sport) parts.push(`${titleCase(sport)} Gear`);
  else if (category) parts.push(displayCategory(category));
  else parts.push("Sportswear");
  if (fit) parts.push(`${fit} fit`);
  if (environment) parts.push(`for ${environment}`);
  if (maxPrice) parts.push(`under ${currency(maxPrice)}`);

  return parts.join(" ");
}

function renderFilters() {
  const filters = getActiveFilters();

  if (!filters.length) {
    elements.filterStrip.innerHTML = `<span class="filter-chip">All products</span>`;
    return;
  }

  elements.filterStrip.innerHTML = filters.map((filter) => `
    <span class="filter-chip">
      ${filter.label}
      <button type="button" aria-label="Remove ${filter.label}" data-remove-filter="${filter.key}">x</button>
    </span>
  `).join("");
}

function renderBrief(matches) {
  const { sport, category, maxPrice, features, environment, size } = state.filters;
  const top = matches[0];
  const topNeed = [
    sport ? titleCase(sport) : "Open",
    category ? displayCategory(category).toLowerCase() : "sportswear"
  ].join(" ");
  const topBudget = maxPrice ? `Up to ${currency(maxPrice)}` : "No budget set";
  const priority = [
    environment ? titleCase(environment) : null,
    size ? `size ${size}` : null,
    ...features.map(titleCase)
  ].filter(Boolean).join(", ") || "best overall match";

  elements.shoppingBrief.innerHTML = `
    <div class="brief-item">
      <span>Intent</span>
      <strong>${topNeed}</strong>
    </div>
    <div class="brief-item">
      <span>Budget</span>
      <strong>${topBudget}</strong>
    </div>
    <div class="brief-item">
      <span>Lead match</span>
      <strong>${top ? `${top.name} at ${currency(top.price)}` : priority}</strong>
    </div>
  `;
}

function renderComparison() {
  if (state.compareIds.length < 2) {
    elements.comparePanel.classList.add("hidden");
    elements.comparePanel.innerHTML = "";
    return;
  }

  const selected = state.compareIds.map((id) => products.find((product) => product.id === id)).filter(Boolean);
  if (selected.length < 2) return;

  elements.comparePanel.classList.remove("hidden");
  elements.comparePanel.innerHTML = `
    <div class="compare-head">
      <h3>Comparison</h3>
      <button class="icon-button" type="button" title="Close comparison" aria-label="Close comparison" data-close-compare>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z" /></svg>
      </button>
    </div>
    <table class="compare-table">
      <tbody>
        <tr><th>Model</th>${selected.map((product) => `<td><strong>${product.name}</strong><br>${product.brand}</td>`).join("")}</tr>
        <tr><th>Price</th>${selected.map((product) => `<td>${currency(product.price)}</td>`).join("")}</tr>
        <tr><th>Best for</th>${selected.map((product) => `<td>${titleCase(product.sport)}: ${product.useCase}</td>`).join("")}</tr>
        <tr><th>Type</th>${selected.map((product) => `<td>${displayCategory(product.category)}</td>`).join("")}</tr>
        <tr><th>Fit</th>${selected.map((product) => `<td>${titleCase(product.fit)} / ${formatSizes(product.sizes)}</td>`).join("")}</tr>
        <tr><th>Use case</th>${selected.map((product) => `<td>${formatEnvironments(product.environment)}</td>`).join("")}</tr>
        <tr><th>Strengths</th>${selected.map((product) => `<td>${product.features.map(titleCase).join(", ")}</td>`).join("")}</tr>
        <tr><th>Rating</th>${selected.map((product) => `<td>${product.rating.toFixed(1)} out of 5</td>`).join("")}</tr>
      </tbody>
    </table>
  `;
}

function renderProducts(matches) {
  if (!matches.length) {
    elements.productGrid.innerHTML = `
      <div class="empty-state">
        <div>
          <h3>No exact products found</h3>
          <p>Try a wider budget, a different color, or clear one of the active filters above.</p>
        </div>
      </div>
    `;
    return;
  }

  elements.productGrid.innerHTML = matches.map((product) => `
    <article class="product-card" style="--visual-soft: ${product.visual.soft}">
      <div class="art-wrap">
        <img class="product-photo" src="${escapeHTML(productImagePath(product))}" alt="${escapeHTML(product.name)}" decoding="async" data-product-image="${product.id}">
        <canvas class="product-art fallback-art" width="520" height="250" data-product-id="${product.id}" aria-hidden="true"></canvas>
        <span class="rating-badge">${product.rating.toFixed(1)}</span>
      </div>
      <div class="product-body">
        <div class="product-kicker">
          <span>${product.brand}</span>
          <span>${displayCategory(product.category)}</span>
        </div>
        <h3>${product.name}</h3>
        <div class="price">${currency(product.price)}</div>
        <div class="tag-list">
          ${product.features.slice(0, 3).map((feature) => `<span class="tag">${titleCase(feature)}</span>`).join("")}
        </div>
      </div>
      <ul class="spec-list">
        <li><span>Item</span><strong>${displayCategory(product.category)}</strong></li>
        <li><span>Size</span><strong>${formatSizes(product.sizes)}</strong></li>
        <li><span>Price</span><strong>${currency(product.price)}</strong></li>
      </ul>
      <div class="card-actions">
        <button class="primary-button" type="button" data-add-cart="${product.id}">Add to cart</button>
        <button class="square-button" type="button" title="Compare ${product.name}" aria-label="Compare ${product.name}" data-compare-product="${product.id}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h6v2H8.4l3.3 3.3-1.4 1.4L7 7.4V10H5V4Zm8 0h6v6h-2V7.4l-3.3 3.3-1.4-1.4L15.6 6H13V4ZM5 14h2v2.6l3.3-3.3 1.4 1.4L8.4 18H11v2H5v-6Zm12 2.6V14h2v6h-6v-2h2.6l-3.3-3.3 1.4-1.4 3.3 3.3Z" /></svg>
        </button>
      </div>
    </article>
  `).join("");

  drawAllProducts();
  wireProductImages();
}

function drawAllProducts() {
  document.querySelectorAll(".product-art").forEach((canvas) => {
    const product = products.find((item) => item.id === canvas.dataset.productId);
    if (product) drawProductArt(canvas, product);
  });
}

function wireProductImages() {
  document.querySelectorAll(".product-photo").forEach((img) => {
    const wrap = img.closest(".art-wrap");
    const showFallback = () => wrap?.classList.add("is-fallback");
    const showPhoto = () => wrap?.classList.remove("is-fallback");

    img.addEventListener("error", showFallback);
    img.addEventListener("load", showPhoto);

    if (img.complete) {
      if (img.naturalWidth > 0) showPhoto();
      else showFallback();
    }
  });
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fillAndStroke(ctx) {
  ctx.fill();
  ctx.stroke();
}

function drawProductArt(canvas, product) {
  const ctx = canvas.getContext("2d");
  const { upper, accent, sole } = product.visual;
  const w = canvas.width;
  const h = canvas.height;
  const name = product.name.toLowerCase();

  ctx.clearRect(0, 0, w, h);
  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.84, w * 0.34, h * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#161719";
  ctx.lineJoin = "round";

  if (["top", "jersey"].includes(product.category)) {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    if (name.includes("tank")) {
      ctx.beginPath();
      ctx.moveTo(w * 0.39, h * 0.22);
      ctx.lineTo(w * 0.46, h * 0.31);
      ctx.lineTo(w * 0.54, h * 0.31);
      ctx.lineTo(w * 0.61, h * 0.22);
      ctx.lineTo(w * 0.69, h * 0.78);
      ctx.lineTo(w * 0.31, h * 0.78);
      ctx.closePath();
      fillAndStroke(ctx);
    } else {
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.2);
      ctx.lineTo(w * 0.45, h * 0.28);
      ctx.lineTo(w * 0.55, h * 0.28);
      ctx.lineTo(w * 0.65, h * 0.2);
      ctx.lineTo(name.includes("rash") || name.includes("wrap") ? w * 0.9 : w * 0.82, h * 0.38);
      ctx.lineTo(name.includes("rash") || name.includes("wrap") ? w * 0.78 : w * 0.71, h * 0.58);
      ctx.lineTo(w * 0.65, h * 0.46);
      ctx.lineTo(w * 0.66, h * 0.79);
      ctx.lineTo(w * 0.34, h * 0.79);
      ctx.lineTo(w * 0.35, h * 0.46);
      ctx.lineTo(name.includes("rash") || name.includes("wrap") ? w * 0.22 : w * 0.29, h * 0.58);
      ctx.lineTo(name.includes("rash") || name.includes("wrap") ? w * 0.1 : w * 0.18, h * 0.38);
      ctx.closePath();
      fillAndStroke(ctx);
    }

    ctx.fillStyle = accent;
    roundedRect(ctx, w * 0.41, h * 0.38, w * 0.18, h * 0.1, 12);
    ctx.fill();

    if (name.includes("polo")) {
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#161719";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.45, h * 0.28);
      ctx.lineTo(w * 0.5, h * 0.39);
      ctx.lineTo(w * 0.55, h * 0.28);
      ctx.stroke();
      roundedRect(ctx, w * 0.44, h * 0.23, w * 0.12, h * 0.07, 8);
      ctx.fill();
    }

    if (product.category === "jersey") {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 54px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("17", w * 0.5, h * 0.66);
    }
  } else if (product.category === "jacket") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    roundedRect(ctx, w * 0.3, h * 0.21, w * 0.4, h * 0.6, 18);
    fillAndStroke(ctx);

    ctx.beginPath();
    ctx.moveTo(w * 0.31, h * 0.3);
    ctx.lineTo(w * 0.16, h * 0.66);
    ctx.lineTo(w * 0.29, h * 0.73);
    ctx.lineTo(w * 0.37, h * 0.43);
    ctx.closePath();
    fillAndStroke(ctx);

    ctx.beginPath();
    ctx.moveTo(w * 0.69, h * 0.3);
    ctx.lineTo(w * 0.84, h * 0.66);
    ctx.lineTo(w * 0.71, h * 0.73);
    ctx.lineTo(w * 0.63, h * 0.43);
    ctx.closePath();
    fillAndStroke(ctx);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.25);
    ctx.lineTo(w * 0.5, h * 0.78);
    ctx.stroke();

    ctx.fillStyle = accent;
    roundedRect(ctx, w * 0.55, h * 0.48, w * 0.1, h * 0.08, 8);
    ctx.fill();
  } else if (product.category === "vest") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    ctx.beginPath();
    ctx.moveTo(w * 0.36, h * 0.2);
    ctx.lineTo(w * 0.45, h * 0.28);
    ctx.lineTo(w * 0.55, h * 0.28);
    ctx.lineTo(w * 0.64, h * 0.2);
    ctx.lineTo(w * 0.72, h * 0.79);
    ctx.lineTo(w * 0.28, h * 0.79);
    ctx.closePath();
    fillAndStroke(ctx);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.28);
    ctx.lineTo(w * 0.5, h * 0.77);
    ctx.stroke();

    ctx.fillStyle = accent;
    roundedRect(ctx, w * 0.56, h * 0.48, w * 0.09, h * 0.08, 7);
    ctx.fill();
  } else if (["shorts", "swimwear"].includes(product.category)) {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    roundedRect(ctx, w * 0.27, h * 0.3, w * 0.46, h * 0.17, 14);
    fillAndStroke(ctx);

    ctx.beginPath();
    ctx.moveTo(w * 0.29, h * 0.43);
    ctx.lineTo(w * 0.48, h * 0.43);
    ctx.lineTo(w * 0.45, h * 0.78);
    ctx.lineTo(w * 0.25, h * 0.78);
    ctx.closePath();
    fillAndStroke(ctx);

    ctx.beginPath();
    ctx.moveTo(w * 0.52, h * 0.43);
    ctx.lineTo(w * 0.71, h * 0.43);
    ctx.lineTo(w * 0.75, h * 0.78);
    ctx.lineTo(w * 0.55, h * 0.78);
    ctx.closePath();
    fillAndStroke(ctx);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.34, h * 0.37);
    ctx.lineTo(w * 0.66, h * 0.37);
    ctx.stroke();
  } else if (product.category === "skirt") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    roundedRect(ctx, w * 0.31, h * 0.29, w * 0.38, h * 0.15, 14);
    fillAndStroke(ctx);

    ctx.beginPath();
    ctx.moveTo(w * 0.34, h * 0.42);
    ctx.lineTo(w * 0.66, h * 0.42);
    ctx.lineTo(w * 0.78, h * 0.79);
    ctx.lineTo(w * 0.22, h * 0.79);
    ctx.closePath();
    fillAndStroke(ctx);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    for (const x of [0.38, 0.5, 0.62]) {
      ctx.beginPath();
      ctx.moveTo(w * x, h * 0.45);
      ctx.lineTo(w * (x - 0.06), h * 0.76);
      ctx.stroke();
    }
  } else if (["leggings", "pants"].includes(product.category)) {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    roundedRect(ctx, w * 0.34, h * 0.18, w * 0.32, h * 0.16, 14);
    fillAndStroke(ctx);

    ctx.beginPath();
    ctx.moveTo(w * 0.36, h * 0.31);
    ctx.lineTo(w * 0.49, h * 0.31);
    ctx.lineTo(w * 0.46, h * 0.82);
    ctx.lineTo(w * 0.32, h * 0.82);
    ctx.closePath();
    fillAndStroke(ctx);

    ctx.beginPath();
    ctx.moveTo(w * 0.51, h * 0.31);
    ctx.lineTo(w * 0.64, h * 0.31);
    ctx.lineTo(w * 0.68, h * 0.82);
    ctx.lineTo(w * 0.54, h * 0.82);
    ctx.closePath();
    fillAndStroke(ctx);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.36);
    ctx.lineTo(w * 0.5, h * 0.78);
    ctx.stroke();
  } else if (product.category === "sports bra") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    ctx.beginPath();
    ctx.moveTo(w * 0.35, h * 0.27);
    ctx.lineTo(w * 0.43, h * 0.22);
    ctx.lineTo(w * 0.47, h * 0.38);
    ctx.lineTo(w * 0.53, h * 0.38);
    ctx.lineTo(w * 0.57, h * 0.22);
    ctx.lineTo(w * 0.65, h * 0.27);
    ctx.lineTo(w * 0.72, h * 0.68);
    ctx.lineTo(w * 0.28, h * 0.68);
    ctx.closePath();
    fillAndStroke(ctx);

    ctx.fillStyle = accent;
    roundedRect(ctx, w * 0.3, h * 0.63, w * 0.4, h * 0.11, 10);
    ctx.fill();
  } else if (product.category === "footwear") {
    ctx.translate(18, 8);
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.62);
    ctx.bezierCurveTo(w * 0.22, h * 0.38, w * 0.35, h * 0.28, w * 0.52, h * 0.36);
    ctx.bezierCurveTo(w * 0.62, h * 0.41, w * 0.68, h * 0.56, w * 0.84, h * 0.58);
    ctx.bezierCurveTo(w * 0.93, h * 0.6, w * 0.96, h * 0.68, w * 0.9, h * 0.73);
    ctx.bezierCurveTo(w * 0.76, h * 0.83, w * 0.32, h * 0.83, w * 0.15, h * 0.74);
    ctx.bezierCurveTo(w * 0.09, h * 0.71, w * 0.08, h * 0.67, w * 0.12, h * 0.62);
    ctx.closePath();
    fillAndStroke(ctx);

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.moveTo(w * 0.29, h * 0.55);
    ctx.bezierCurveTo(w * 0.4, h * 0.42, w * 0.52, h * 0.43, w * 0.63, h * 0.57);
    ctx.bezierCurveTo(w * 0.55, h * 0.62, w * 0.4, h * 0.63, w * 0.29, h * 0.55);
    ctx.fill();

    ctx.fillStyle = sole;
    ctx.strokeStyle = "#161719";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.13, h * 0.72);
    ctx.bezierCurveTo(w * 0.32, h * 0.81, w * 0.76, h * 0.81, w * 0.9, h * 0.72);
    ctx.lineTo(w * 0.88, h * 0.83);
    ctx.bezierCurveTo(w * 0.7, h * 0.9, w * 0.32, h * 0.9, w * 0.13, h * 0.8);
    ctx.closePath();
    fillAndStroke(ctx);

    if (name.includes("cleat")) {
      ctx.fillStyle = "#161719";
      [0.28, 0.42, 0.58, 0.73].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(w * x, h * 0.84);
        ctx.lineTo(w * (x + 0.035), h * 0.84);
        ctx.lineTo(w * (x + 0.017), h * 0.92);
        ctx.closePath();
        ctx.fill();
      });
    } else if (name.includes("slide") || name.includes("sandal")) {
      ctx.strokeStyle = accent;
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(w * 0.35, h * 0.55);
      ctx.quadraticCurveTo(w * 0.5, h * 0.45, w * 0.66, h * 0.58);
      ctx.stroke();
    }
  } else if (product.category === "socks") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    roundedRect(ctx, w * 0.34, h * 0.22, w * 0.13, h * 0.46, 10);
    fillAndStroke(ctx);
    roundedRect(ctx, w * 0.53, h * 0.22, w * 0.13, h * 0.46, 10);
    fillAndStroke(ctx);

    ctx.fillStyle = accent;
    roundedRect(ctx, w * 0.31, h * 0.61, w * 0.19, h * 0.13, 12);
    ctx.fill();
    roundedRect(ctx, w * 0.5, h * 0.61, w * 0.19, h * 0.13, 12);
    ctx.fill();
  } else if (product.category === "hat") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    ctx.beginPath();
    ctx.arc(w * 0.48, h * 0.46, w * 0.18, Math.PI, Math.PI * 2);
    ctx.lineTo(w * 0.66, h * 0.61);
    ctx.lineTo(w * 0.3, h * 0.61);
    ctx.closePath();
    fillAndStroke(ctx);

    ctx.fillStyle = accent;
    ctx.strokeStyle = "#161719";
    ctx.beginPath();
    ctx.moveTo(w * 0.61, h * 0.53);
    ctx.quadraticCurveTo(w * 0.82, h * 0.55, w * 0.87, h * 0.65);
    ctx.quadraticCurveTo(w * 0.72, h * 0.69, w * 0.61, h * 0.62);
    ctx.closePath();
    fillAndStroke(ctx);
  } else if (product.category === "gloves") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    roundedRect(ctx, w * 0.28, h * 0.33, w * 0.18, h * 0.36, 18);
    fillAndStroke(ctx);
    roundedRect(ctx, w * 0.54, h * 0.33, w * 0.18, h * 0.36, 18);
    fillAndStroke(ctx);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.33, h * 0.35);
    ctx.lineTo(w * 0.33, h * 0.2);
    ctx.moveTo(w * 0.59, h * 0.35);
    ctx.lineTo(w * 0.59, h * 0.2);
    ctx.stroke();
  } else if (product.category === "racket") {
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#161719";
    ctx.fillStyle = upper;
    ctx.beginPath();
    ctx.ellipse(w * 0.45, h * 0.37, w * 0.18, h * 0.25, -0.25, 0, Math.PI * 2);
    fillAndStroke(ctx);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    for (const x of [0.36, 0.41, 0.46, 0.51, 0.56]) {
      ctx.beginPath();
      ctx.moveTo(w * x, h * 0.18);
      ctx.lineTo(w * (x - 0.04), h * 0.57);
      ctx.stroke();
    }
    for (const y of [0.26, 0.34, 0.42, 0.5]) {
      ctx.beginPath();
      ctx.moveTo(w * 0.31, h * y);
      ctx.lineTo(w * 0.58, h * (y + 0.02));
      ctx.stroke();
    }

    ctx.strokeStyle = "#161719";
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.moveTo(w * 0.56, h * 0.56);
    ctx.lineTo(w * 0.76, h * 0.82);
    ctx.stroke();
  } else if (product.category === "resistance band") {
    ctx.lineWidth = 12;
    ctx.strokeStyle = upper;
    ctx.beginPath();
    ctx.ellipse(w * 0.38, h * 0.52, w * 0.16, h * 0.24, -0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = accent;
    ctx.beginPath();
    ctx.ellipse(w * 0.59, h * 0.52, w * 0.16, h * 0.24, 0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#161719";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.28, h * 0.78);
    ctx.bezierCurveTo(w * 0.4, h * 0.66, w * 0.58, h * 0.66, w * 0.72, h * 0.78);
    ctx.stroke();
  } else if (product.category === "mat") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    ctx.beginPath();
    ctx.ellipse(w * 0.37, h * 0.42, w * 0.14, h * 0.2, 0, 0, Math.PI * 2);
    fillAndStroke(ctx);
    roundedRect(ctx, w * 0.37, h * 0.25, w * 0.36, h * 0.34, 18);
    fillAndStroke(ctx);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.ellipse(w * 0.37, h * 0.42, w * 0.07, h * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (product.category === "bottle") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    roundedRect(ctx, w * 0.39, h * 0.28, w * 0.22, h * 0.5, 28);
    fillAndStroke(ctx);
    roundedRect(ctx, w * 0.43, h * 0.18, w * 0.14, h * 0.14, 10);
    fillAndStroke(ctx);
    ctx.fillStyle = accent;
    roundedRect(ctx, w * 0.42, h * 0.48, w * 0.16, h * 0.12, 12);
    ctx.fill();
  } else if (product.category === "ball") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.52, w * 0.24, 0, Math.PI * 2);
    fillAndStroke(ctx);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.52, w * 0.16, -0.5, Math.PI + 0.5);
    ctx.moveTo(w * 0.28, h * 0.52);
    ctx.lineTo(w * 0.72, h * 0.52);
    ctx.moveTo(w * 0.5, h * 0.28);
    ctx.lineTo(w * 0.5, h * 0.76);
    ctx.stroke();
  } else if (product.category === "helmet") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    ctx.beginPath();
    ctx.moveTo(w * 0.27, h * 0.56);
    ctx.quadraticCurveTo(w * 0.5, h * 0.2, w * 0.74, h * 0.56);
    ctx.lineTo(w * 0.67, h * 0.7);
    ctx.lineTo(w * 0.34, h * 0.7);
    ctx.closePath();
    fillAndStroke(ctx);
    ctx.fillStyle = accent;
    roundedRect(ctx, w * 0.38, h * 0.43, w * 0.24, h * 0.1, 12);
    ctx.fill();
  } else if (product.category === "accessory" && name.includes("knee pad")) {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    roundedRect(ctx, w * 0.31, h * 0.3, w * 0.16, h * 0.42, 26);
    fillAndStroke(ctx);
    roundedRect(ctx, w * 0.53, h * 0.3, w * 0.16, h * 0.42, 26);
    fillAndStroke(ctx);
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(w * 0.39, h * 0.53, w * 0.06, 0, Math.PI * 2);
    ctx.arc(w * 0.61, h * 0.53, w * 0.06, 0, Math.PI * 2);
    ctx.fill();
  } else if (product.category === "accessory" && name.includes("shin guard")) {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    ctx.beginPath();
    ctx.moveTo(w * 0.33, h * 0.24);
    ctx.lineTo(w * 0.47, h * 0.24);
    ctx.lineTo(w * 0.44, h * 0.78);
    ctx.lineTo(w * 0.3, h * 0.78);
    ctx.closePath();
    fillAndStroke(ctx);
    ctx.beginPath();
    ctx.moveTo(w * 0.53, h * 0.24);
    ctx.lineTo(w * 0.67, h * 0.24);
    ctx.lineTo(w * 0.7, h * 0.78);
    ctx.lineTo(w * 0.56, h * 0.78);
    ctx.closePath();
    fillAndStroke(ctx);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(w * 0.33, h * 0.42);
    ctx.lineTo(w * 0.46, h * 0.42);
    ctx.moveTo(w * 0.54, h * 0.42);
    ctx.lineTo(w * 0.67, h * 0.42);
    ctx.stroke();
  } else if (product.category === "accessory" && name.includes("sleeve")) {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    ctx.save();
    ctx.translate(w * 0.5, h * 0.52);
    ctx.rotate(-0.18);
    roundedRect(ctx, -w * 0.12, -h * 0.28, w * 0.24, h * 0.56, 24);
    fillAndStroke(ctx);
    ctx.fillStyle = accent;
    roundedRect(ctx, -w * 0.11, h * 0.16, w * 0.22, h * 0.08, 10);
    ctx.fill();
    ctx.restore();
  } else if (product.category === "accessory") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    roundedRect(ctx, w * 0.28, h * 0.36, w * 0.44, h * 0.22, 20);
    fillAndStroke(ctx);
    ctx.fillStyle = accent;
    roundedRect(ctx, w * 0.35, h * 0.42, w * 0.3, h * 0.1, 12);
    ctx.fill();

    ctx.strokeStyle = "#161719";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, h * 0.69);
    ctx.lineTo(w * 0.7, h * 0.69);
    ctx.stroke();
  } else if (product.category === "bag") {
    ctx.lineWidth = 6;
    ctx.fillStyle = upper;
    ctx.strokeStyle = "#161719";
    roundedRect(ctx, w * 0.22, h * 0.39, w * 0.56, h * 0.35, 22);
    fillAndStroke(ctx);

    ctx.strokeStyle = accent;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(w * 0.36, h * 0.39);
    ctx.quadraticCurveTo(w * 0.5, h * 0.17, w * 0.64, h * 0.39);
    ctx.stroke();

    ctx.fillStyle = sole;
    roundedRect(ctx, w * 0.58, h * 0.5, w * 0.12, h * 0.1, 8);
    ctx.fill();
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  roundedRect(ctx, 18, 18, 140, 34, 17);
  ctx.fill();
  ctx.fillStyle = "#17181c";
  ctx.font = "800 18px system-ui";
  ctx.textAlign = "left";
  ctx.fillText(displayCategory(product.category), 32, 41);

  ctx.restore();
}

function render() {
  const matches = getFilteredProducts();
  const activeFilters = getActiveFilters();

  elements.catalogueTitle.textContent = getCatalogueTitle();
  elements.intentLabel.textContent = activeFilters.length ? "Catalogue reshaped by chat" : "Browsing all sportswear";
  elements.resultCount.textContent = String(matches.length);

  renderFilters();
  renderBrief(matches);
  renderComparison();
  renderProducts(matches);
}

function addMessage(role, text, meta = "") {
  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.innerHTML = `${escapeHTML(text)}${meta ? `<small>${escapeHTML(meta)}</small>` : ""}`;
  elements.chatMessages.append(message);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
  return message;
}

async function requestAssistantIntent(text) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: text,
      filters: state.filters,
      sort: state.sort,
      view: state.view
    })
  });

  if (!response.ok) {
    let message = "Assistant request failed.";

    try {
      const payload = await response.json();
      if (payload?.error) message = payload.error;
    } catch {
      // Ignore JSON parse errors and use the default message.
    }

    throw new Error(message);
  }

  return response.json();
}

function setChatPending(isPending) {
  elements.chatInput.disabled = isPending;
  elements.chatForm.querySelector('button[type="submit"]').disabled = isPending;
}

async function handleUserMessage(text) {
  addMessage("user", text);
  setChatPending(true);
  const pendingMessage = addMessage("bot", "Thinking...");

  try {
    const payload = await requestAssistantIntent(text);
    const intent = {
      updates: payload.intent?.updates || {},
      addedFeatures: payload.intent?.addedFeatures || [],
      actions: payload.intent?.actions || [],
      notes: payload.intent?.notes || []
    };

    applyIntent(intent);
    const matches = getFilteredProducts();
    if (intent.actions.includes("compare")) {
      state.compareIds = matches.slice(0, 2).map((product) => product.id);
    }

    render();
    pendingMessage.remove();
    addMessage("bot", payload.reply || buildReply(text, intent, matches), payload.source === "fallback" ? "Local fallback" : "AI assistant");
  } catch (error) {
    const intent = parseIntent(text);
    applyIntent(intent);
    const matches = getFilteredProducts();
    if (intent.actions.includes("compare")) {
      state.compareIds = matches.slice(0, 2).map((product) => product.id);
    }

    render();
    pendingMessage.remove();
    addMessage("bot", buildReply(text, intent, matches), "Local fallback");
    console.error("Chat request failed, using local fallback:", error);
  } finally {
    setChatPending(false);
  }
}

elements.chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = elements.chatInput.value.trim();
  if (!text) return;
  elements.chatInput.value = "";
  await handleUserMessage(text);
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", async () => {
    await handleUserMessage(button.dataset.prompt);
  });
});

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    state.view = button.dataset.view;
    document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("active", item === button));
    render();
  });
});

elements.sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  render();
});

elements.resetButton.addEventListener("click", () => {
  resetState();
  render();
  addMessage("bot", "I reset the storefront to the full catalogue.");
});

document.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-filter]");
  const addCartButton = event.target.closest("[data-add-cart]");
  const compareButton = event.target.closest("[data-compare-product]");
  const closeCompareButton = event.target.closest("[data-close-compare]");

  if (removeButton) {
    const key = removeButton.dataset.removeFilter;
    if (key.startsWith("feature:")) {
      const feature = key.split(":")[1];
      state.filters.features = state.filters.features.filter((item) => item !== feature);
    } else {
      state.filters[key] = emptyFilters[key];
    }
    state.compareIds = [];
    render();
  }

  if (addCartButton) {
    state.cart += 1;
    elements.cartCount.textContent = String(state.cart);
    const product = products.find((item) => item.id === addCartButton.dataset.addCart);
    addMessage("bot", `${product.name} is in the cart.`);
  }

  if (compareButton) {
    const id = compareButton.dataset.compareProduct;
    state.compareIds = [...new Set([id, ...state.compareIds])].slice(0, 2);
    if (state.compareIds.length === 1) {
      const next = state.lastMatchedIds.find((matchId) => matchId !== id);
      if (next) state.compareIds.push(next);
    }
    render();
  }

  if (closeCompareButton) {
    state.compareIds = [];
    render();
  }
});

addMessage(
  "bot",
  "I can reshape the catalogue around the way you ask.",
  "For example: breathable running clothes under $75, yoga leggings with pockets, or compare the first two."
);
render();
