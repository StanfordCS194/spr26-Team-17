const products = [
  {
    id: "nike-vapor-pro",
    name: "NikeCourt Vapor Pro",
    brand: "Nike",
    category: "shoes",
    sport: "tennis",
    price: 118,
    rating: 4.7,
    colors: ["white", "blue"],
    sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 12],
    width: "regular",
    court: ["hard"],
    features: ["lightweight", "responsive", "breathable"],
    fit: "locked-in",
    surface: "hard court",
    visual: { upper: "#f8f8f4", accent: "#3077e8", sole: "#1d2027", soft: "#dce8ff" },
    image: {
      src: "https://img.tennis-warehouse.com/watermark/rs.php?path=NMV2BKW-1.jpg&nw=700",
      source: "Tennis Warehouse"
    }
  },
  {
    id: "adidas-barricade",
    name: "Adidas Barricade 14",
    brand: "Adidas",
    category: "shoes",
    sport: "tennis",
    price: 136,
    rating: 4.8,
    colors: ["black", "green"],
    sizes: [7.5, 8, 9, 10, 10.5, 11, 11.5, 12],
    width: "regular",
    court: ["hard", "clay"],
    features: ["stable", "durable", "supportive"],
    fit: "structured",
    surface: "hard and clay",
    visual: { upper: "#202326", accent: "#78d25b", sole: "#e7e9e1", soft: "#dff7d6" },
    image: {
      src: "https://img.tennis-warehouse.com/watermark/rs.php?path=AM14ABO-1.jpg&nw=700",
      source: "Tennis Warehouse"
    }
  },
  {
    id: "asics-resolution",
    name: "ASICS Gel Resolution 9",
    brand: "ASICS",
    category: "shoes",
    sport: "tennis",
    price: 124,
    rating: 4.9,
    colors: ["white", "red"],
    sizes: [8, 9, 9.5, 10, 10.5, 11, 12, 13],
    width: "wide",
    court: ["hard", "clay"],
    features: ["cushioned", "stable", "durable"],
    fit: "wide friendly",
    surface: "hard and clay",
    visual: { upper: "#fbfaf4", accent: "#ef4f43", sole: "#282a30", soft: "#ffe2dc" },
    image: {
      src: "https://images.asics.com/is/image/asics/1041A453_100_SR_RT_GLB?$sfcc-product$",
      source: "ASICS"
    }
  },
  {
    id: "new-balance-rally",
    name: "New Balance FuelCell 996v6",
    brand: "New Balance",
    category: "shoes",
    sport: "tennis",
    price: 96,
    rating: 4.5,
    colors: ["gray", "navy"],
    sizes: [7, 8, 8.5, 9, 10, 11, 12],
    width: "wide",
    court: ["hard"],
    features: ["lightweight", "cushioned", "breathable"],
    fit: "roomy",
    surface: "hard court",
    visual: { upper: "#cfd4d8", accent: "#243e63", sole: "#f9faf4", soft: "#e1edf2" },
    image: {
      src: "https://img.tennis-warehouse.com/watermark/rs.php?path=NBV6BWE-1.jpg&nw=700",
      source: "Tennis Warehouse"
    }
  },
  {
    id: "wilson-rush-lite",
    name: "Wilson Rush Pro Lite",
    brand: "Wilson",
    category: "shoes",
    sport: "tennis",
    price: 88,
    rating: 4.3,
    colors: ["blue", "yellow"],
    sizes: [7, 8, 9, 10, 11, 12],
    width: "regular",
    court: ["hard", "clay"],
    features: ["lightweight", "beginner", "responsive"],
    fit: "easy",
    surface: "hard and clay",
    visual: { upper: "#2e6dd6", accent: "#f2cf47", sole: "#f8f8f3", soft: "#dce8ff" },
    image: {
      src: "https://img.tennis-warehouse.com/watermark/rs.php?path=WMRLCBW-1.jpg&nw=700",
      source: "Tennis Warehouse"
    }
  },
  {
    id: "nike-pegasus-road",
    name: "Nike Pegasus 41 Road",
    brand: "Nike",
    category: "shoes",
    sport: "running",
    price: 112,
    rating: 4.7,
    colors: ["black", "white"],
    sizes: [8, 9, 10, 10.5, 11, 12, 13],
    width: "regular",
    court: [],
    features: ["cushioned", "responsive", "daily trainer"],
    fit: "balanced",
    surface: "road",
    visual: { upper: "#191b20", accent: "#ffffff", sole: "#d6f264", soft: "#edf2df" },
    image: {
      src: "https://img.runningwarehouse.com/watermark/rs.php?path=N41PM01-1.jpg&nw=700",
      source: "Running Warehouse"
    }
  },
  {
    id: "adidas-ultraboost",
    name: "Adidas Ultraboost 5",
    brand: "Adidas",
    category: "shoes",
    sport: "running",
    price: 150,
    rating: 4.6,
    colors: ["white", "orange"],
    sizes: [7, 8, 9, 9.5, 10, 11, 12],
    width: "regular",
    court: [],
    features: ["cushioned", "breathable", "lifestyle"],
    fit: "sock-like",
    surface: "road and street",
    visual: { upper: "#faf9f2", accent: "#ff714f", sole: "#24272c", soft: "#ffe5dc" },
    image: {
      src: "https://img.runningwarehouse.com/watermark/rs.php?path=AU5XM10-1.jpg&nw=700",
      source: "Running Warehouse"
    }
  },
  {
    id: "jordan-court-rise",
    name: "Jordan Max Aura 6",
    brand: "Jordan",
    category: "shoes",
    sport: "basketball",
    price: 128,
    rating: 4.4,
    colors: ["red", "black"],
    sizes: [8, 9, 10, 11, 12, 13, 14],
    width: "regular",
    court: [],
    features: ["supportive", "cushioned", "ankle support"],
    fit: "secure",
    surface: "indoor court",
    visual: { upper: "#c52f2f", accent: "#111217", sole: "#f7f4ea", soft: "#f7dada" },
    image: {
      src: "https://grailify.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsiZGF0YSI6MTg1Nzg3OSwicHVyIjoiYmxvYl9pZCJ9fQ==--e17627822713a48846451bb13964f5f8006dd5c9/eyJfcmFpbHMiOnsiZGF0YSI6eyJmb3JtYXQiOiJqcGciLCJyZXNpemVfdG9fZml0IjpbODAwLDgwMF0sInF1YWxpdHkiOjkwfSwicHVyIjoidmFyaWF0aW9uIn19--8c7d630b9b8fd5b9c842c93487267dfcebc5691c/FQ8298_006_E_PREM.jpeg",
      source: "Grailify"
    }
  },
  {
    id: "puma-trainer-flex",
    name: "Puma Fuse 4.0 Trainer",
    brand: "Puma",
    category: "shoes",
    sport: "training",
    price: 72,
    rating: 4.2,
    colors: ["green", "white"],
    sizes: [7, 8, 9, 10, 10.5, 11, 12],
    width: "regular",
    court: [],
    features: ["stable", "lightweight", "gym"],
    fit: "flexible",
    surface: "gym floor",
    visual: { upper: "#245f45", accent: "#f8f8f4", sole: "#111217", soft: "#dff4e7" },
    image: {
      src: "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_1000,h_1000/global/311733/06/sv01/fnd/PNA/fmt/png/Fuse-4.0-Training-Shoes",
      source: "PUMA"
    }
  },
  {
    id: "converse-city-canvas",
    name: "Converse Chuck Taylor All Star",
    brand: "Converse",
    category: "shoes",
    sport: "lifestyle",
    price: 64,
    rating: 4.1,
    colors: ["black", "white"],
    sizes: [6, 7, 8, 9, 10, 11, 12],
    width: "regular",
    court: [],
    features: ["casual", "canvas", "street"],
    fit: "classic",
    surface: "street",
    visual: { upper: "#111217", accent: "#ffffff", sole: "#f1ede4", soft: "#ecece7" },
    image: {
      src: "https://upload.wikimedia.org/wikipedia/commons/2/26/Converse_Chuck_Taylor_All-Stars_%2851091002425%29.jpg",
      source: "Wikimedia Commons"
    }
  },
  {
    id: "salomon-trail-grip",
    name: "Salomon Genesis Trail",
    brand: "Salomon",
    category: "shoes",
    sport: "trail",
    price: 142,
    rating: 4.8,
    colors: ["brown", "orange"],
    sizes: [8, 9, 10, 11, 11.5, 12, 13],
    width: "regular",
    court: [],
    features: ["waterproof", "durable", "grippy"],
    fit: "protective",
    surface: "trail",
    visual: { upper: "#6d5036", accent: "#ff8a35", sole: "#161719", soft: "#f3e4d8" },
    image: {
      src: "https://img.runningwarehouse.com/watermark/rs.php?path=SA1GEM3-1.jpg&nw=700",
      source: "Running Warehouse"
    }
  },
  {
    id: "reebok-club-classic",
    name: "Reebok Club C 85",
    brand: "Reebok",
    category: "shoes",
    sport: "lifestyle",
    price: 82,
    rating: 4.5,
    colors: ["white", "green"],
    sizes: [7, 8, 8.5, 9, 10, 11, 12],
    width: "regular",
    court: [],
    features: ["casual", "leather", "clean"],
    fit: "classic",
    surface: "street",
    visual: { upper: "#fcfbf5", accent: "#26714d", sole: "#22252a", soft: "#e5f1e8" },
    image: {
      src: "https://www.getoutsideshoes.com/cdn/shop/products/r_b_rb-ar0456-1053-1_1_grande.jpg?v=1701811433",
      source: "Getoutside Shoes"
    }
  }
];

const sportAliases = {
  tennis: ["tennis", "court shoe", "court shoes", "racket"],
  running: ["running", "runner", "jogging", "road"],
  basketball: ["basketball", "hoop", "hoops"],
  training: ["training", "trainer", "gym", "workout", "lifting"],
  lifestyle: ["casual", "lifestyle", "street", "everyday", "walking"],
  trail: ["trail", "hiking", "hike", "outdoor"]
};

const brandAliases = ["nike", "adidas", "asics", "new balance", "wilson", "jordan", "puma", "converse", "salomon", "reebok"];
const colorAliases = ["white", "black", "blue", "green", "red", "gray", "grey", "navy", "orange", "yellow", "brown"];
const featureAliases = {
  lightweight: ["lightweight", "light", "fast"],
  cushioned: ["cushion", "cushioned", "comfortable", "comfort", "soft"],
  stable: ["stable", "stability", "support", "supportive"],
  durable: ["durable", "durability", "last long", "tough"],
  breathable: ["breathable", "breathability", "cool"],
  waterproof: ["waterproof", "rain", "wet"],
  grippy: ["grip", "grippy", "traction"]
};

const emptyFilters = {
  sport: null,
  brand: null,
  color: null,
  maxPrice: null,
  size: null,
  width: null,
  court: null,
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
  const { sport, brand, color, maxPrice, size, width, court, features } = state.filters;

  if (sport) filters.push({ key: "sport", label: titleCase(sport) });
  if (brand) filters.push({ key: "brand", label: brand });
  if (color) filters.push({ key: "color", label: titleCase(color) });
  if (maxPrice) filters.push({ key: "maxPrice", label: `Under ${currency(maxPrice)}` });
  if (size) filters.push({ key: "size", label: `Size ${size}` });
  if (width) filters.push({ key: "width", label: titleCase(width) });
  if (court) filters.push({ key: "court", label: `${titleCase(court)} court` });
  features.forEach((feature) => filters.push({ key: `feature:${feature}`, label: titleCase(feature) }));

  return filters;
}

function productScore(product) {
  let score = product.rating * 10;
  const filters = state.filters;

  if (filters.sport && product.sport === filters.sport) score += 32;
  if (filters.brand && product.brand.toLowerCase() === filters.brand.toLowerCase()) score += 18;
  if (filters.color && product.colors.includes(filters.color)) score += 12;
  if (filters.maxPrice && product.price <= filters.maxPrice) score += 10;
  if (filters.size && product.sizes.includes(Number(filters.size))) score += 8;
  if (filters.width && product.width === filters.width) score += 8;
  if (filters.court && product.court.includes(filters.court)) score += 8;
  score += filters.features.filter((feature) => product.features.includes(feature)).length * 9;

  if (state.view === "performance") score += product.features.length * 2;
  if (state.view === "price") score -= product.price / 10;

  return score;
}

function productMatches(product) {
  const { sport, brand, color, maxPrice, size, width, court, features } = state.filters;

  if (sport && product.sport !== sport) return false;
  if (brand && product.brand.toLowerCase() !== brand.toLowerCase()) return false;
  if (color && !product.colors.includes(color)) return false;
  if (maxPrice && product.price > maxPrice) return false;
  if (size && !product.sizes.includes(Number(size))) return false;
  if (width && product.width !== width) return false;
  if (court && !product.court.includes(court)) return false;
  if (features.length && !features.every((feature) => product.features.includes(feature))) return false;

  return true;
}

function getFilteredProducts() {
  const exact = products.filter(productMatches);
  state.lastExactCount = exact.length;
  const base = exact.length ? exact : products.filter((product) => {
    const { sport, brand, maxPrice } = state.filters;
    if (sport && product.sport !== sport) return false;
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

  if (includesAny(text, ["reset", "clear", "start over", "show all", "all shoes", "all sneakers"])) {
    actions.push("reset");
    return { updates, addedFeatures, actions, notes: ["Reset to the full catalogue."] };
  }

  if (includesAny(text, ["compare", "versus", "vs"])) {
    actions.push("compare");
  }

  Object.entries(sportAliases).forEach(([sport, aliases]) => {
    if (includesAny(text, aliases)) updates.sport = sport;
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

  if (includesAny(text, ["wide feet", "wide foot", "wide fit", "wide"])) {
    updates.width = "wide";
  }

  if (includesAny(text, ["regular width", "standard width"])) {
    updates.width = "regular";
  }

  if (text.includes("hard court") || text.includes("hardcourt")) updates.court = "hard";
  if (text.includes("clay")) updates.court = "clay";
  if (text.includes("grass")) {
    updates.court = "grass";
    notes.push("The demo catalogue has no grass-court models, so I will show the closest tennis options.");
  }

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

  const sizeMatch = text.match(/size\s*(\d{1,2}(?:\.\d)?)/) || text.match(/\b(\d{1,2}(?:\.\d)?)\s*(?:mens|men's|womens|women's)\b/);
  if (sizeMatch) updates.size = Number(sizeMatch[1]);

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
  if (intent.actions.includes("reset")) return "Back to the full sneaker wall.";

  if (intent.actions.includes("compare")) {
    return matches.length >= 2
      ? `I pulled the first two matches into a comparison: ${matches[0].name} and ${matches[1].name}.`
      : "I need at least two matching products before I can compare them.";
  }

  const active = getActiveFilters().map((item) => item.label);
  const exactLine = state.lastExactCount
    ? `${matches.length} match${matches.length === 1 ? "" : "es"} now fit the request.`
    : "I could not find an exact match, so I relaxed the strictest parts and kept the closest options visible.";

  const nextQuestion = state.filters.sport === "tennis" && !state.filters.court
    ? "Court surface would sharpen this: hard, clay, or grass?"
    : !state.filters.maxPrice
      ? "A budget would help me tighten the list."
      : !state.filters.size
        ? "Add a size if you want only pairs that are in stock for you."
        : "You can ask me to compare, sort by price, or narrow by color.";

  const notes = intent.notes.length ? ` ${intent.notes.join(" ")}` : "";
  return `${exactLine}${notes} ${active.length ? `Active filters: ${active.join(", ")}.` : ""} ${nextQuestion}`;
}

function getCatalogueTitle() {
  const { sport, brand, color, maxPrice, width, court } = state.filters;
  const parts = [];

  if (color) parts.push(titleCase(color));
  if (brand) parts.push(brand);
  if (sport) parts.push(`${titleCase(sport)} Shoes`);
  else parts.push("Sneakers");
  if (width) parts.push(`for ${width} feet`);
  if (court) parts.push(`for ${court} court`);
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
  const { sport, maxPrice, features, court, size } = state.filters;
  const top = matches[0];
  const topNeed = sport ? `${titleCase(sport)} performance` : "open browsing";
  const topBudget = maxPrice ? `Up to ${currency(maxPrice)}` : "No budget set";
  const priority = [
    court ? `${titleCase(court)} court` : null,
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
        <tr><th>Best for</th>${selected.map((product) => `<td>${titleCase(product.sport)} on ${product.surface}</td>`).join("")}</tr>
        <tr><th>Fit</th>${selected.map((product) => `<td>${titleCase(product.fit)} / ${titleCase(product.width)}</td>`).join("")}</tr>
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
        <img class="product-photo" src="${escapeHTML(product.image.src)}" alt="${escapeHTML(product.name)}" loading="lazy" referrerpolicy="no-referrer" data-product-image="${product.id}">
        <canvas class="shoe-art fallback-art" width="520" height="250" data-product-id="${product.id}" aria-hidden="true"></canvas>
        <span class="rating-badge">${product.rating.toFixed(1)}</span>
      </div>
      <div class="product-body">
        <div class="product-kicker">
          <span>${product.brand}</span>
          <span>${titleCase(product.sport)}</span>
        </div>
        <h3>${product.name}</h3>
        <div class="price">${currency(product.price)}</div>
        <div class="tag-list">
          ${product.features.slice(0, 3).map((feature) => `<span class="tag">${titleCase(feature)}</span>`).join("")}
        </div>
      </div>
      <ul class="spec-list">
        <li><span>Surface</span><strong>${product.surface}</strong></li>
        <li><span>Fit</span><strong>${product.fit}</strong></li>
        <li><span>Sizes</span><strong>${product.sizes[0]}-${product.sizes[product.sizes.length - 1]}</strong></li>
      </ul>
      <div class="card-actions">
        <button class="primary-button" type="button" data-add-cart="${product.id}">Add to cart</button>
        <button class="square-button" type="button" title="Compare ${product.name}" aria-label="Compare ${product.name}" data-compare-product="${product.id}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h6v2H8.4l3.3 3.3-1.4 1.4L7 7.4V10H5V4Zm8 0h6v6h-2V7.4l-3.3 3.3-1.4-1.4L15.6 6H13V4ZM5 14h2v2.6l3.3-3.3 1.4 1.4L8.4 18H11v2H5v-6Zm12 2.6V14h2v6h-6v-2h2.6l-3.3-3.3 1.4-1.4 3.3 3.3Z" /></svg>
        </button>
      </div>
    </article>
  `).join("");

  drawAllShoes();
  wireProductImages();
}

function drawAllShoes() {
  document.querySelectorAll(".shoe-art").forEach((canvas) => {
    const product = products.find((item) => item.id === canvas.dataset.productId);
    if (product) drawShoe(canvas, product);
  });
}

function wireProductImages() {
  document.querySelectorAll(".product-photo").forEach((img) => {
    const showFallback = () => {
      img.closest(".art-wrap")?.classList.add("is-fallback");
    };

    img.addEventListener("error", showFallback, { once: true });

    if (img.complete && img.naturalWidth === 0) {
      showFallback();
    }
  });
}

function drawShoe(canvas, product) {
  const ctx = canvas.getContext("2d");
  const { upper, accent, sole } = product.visual;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(18, 8);

  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.82, w * 0.35, h * 0.055, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = upper;
  ctx.strokeStyle = "#161719";
  ctx.lineWidth = 6;
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(w * 0.12, h * 0.62);
  ctx.bezierCurveTo(w * 0.22, h * 0.38, w * 0.35, h * 0.28, w * 0.52, h * 0.36);
  ctx.bezierCurveTo(w * 0.62, h * 0.41, w * 0.68, h * 0.56, w * 0.84, h * 0.58);
  ctx.bezierCurveTo(w * 0.93, h * 0.6, w * 0.96, h * 0.68, w * 0.9, h * 0.73);
  ctx.bezierCurveTo(w * 0.76, h * 0.83, w * 0.32, h * 0.83, w * 0.15, h * 0.74);
  ctx.bezierCurveTo(w * 0.09, h * 0.71, w * 0.08, h * 0.67, w * 0.12, h * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(w * 0.29, h * 0.55);
  ctx.bezierCurveTo(w * 0.4, h * 0.42, w * 0.52, h * 0.43, w * 0.63, h * 0.57);
  ctx.bezierCurveTo(w * 0.55, h * 0.62, w * 0.4, h * 0.63, w * 0.29, h * 0.55);
  ctx.fill();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(w * 0.59, h * 0.42);
  ctx.lineTo(w * 0.74, h * 0.59);
  ctx.stroke();

  ctx.strokeStyle = "#f7f8f1";
  ctx.lineWidth = 4;
  for (let i = 0; i < 4; i += 1) {
    const startX = w * (0.39 + i * 0.05);
    ctx.beginPath();
    ctx.moveTo(startX, h * 0.49);
    ctx.lineTo(startX + w * 0.09, h * 0.61);
    ctx.stroke();
  }

  ctx.fillStyle = sole;
  ctx.strokeStyle = "#161719";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(w * 0.13, h * 0.72);
  ctx.bezierCurveTo(w * 0.32, h * 0.81, w * 0.76, h * 0.81, w * 0.9, h * 0.72);
  ctx.lineTo(w * 0.88, h * 0.83);
  ctx.bezierCurveTo(w * 0.7, h * 0.9, w * 0.32, h * 0.9, w * 0.13, h * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(w * 0.22, h * 0.79);
  ctx.lineTo(w * 0.78, h * 0.79);
  ctx.stroke();

  ctx.restore();
}

function render() {
  const matches = getFilteredProducts();
  const activeFilters = getActiveFilters();

  elements.catalogueTitle.textContent = getCatalogueTitle();
  elements.intentLabel.textContent = activeFilters.length ? "Catalogue reshaped by chat" : "Browsing all sneakers";
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
}

function handleUserMessage(text) {
  addMessage("user", text);
  const intent = parseIntent(text);
  applyIntent(intent);
  const matches = getFilteredProducts();
  if (intent.actions.includes("compare")) {
    state.compareIds = matches.slice(0, 2).map((product) => product.id);
  }
  render();
  addMessage("bot", buildReply(text, intent, matches));
}

elements.chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.chatInput.value.trim();
  if (!text) return;
  elements.chatInput.value = "";
  handleUserMessage(text);
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    handleUserMessage(button.dataset.prompt);
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
  "For example: tennis shoes under $120, white hard-court shoes, or compare the first two."
);
render();
