// ============================================================
// src/planet-facts.js — Science briefing data for each planet
// Context students need BEFORE tackling the lab question
// ============================================================

export const planetFacts = {
  mercury: {
    subtitle: "The Swift Messenger",
    overview: "Mercury is the smallest planet and closest to the Sun. It whips around its orbit in just 88 Earth days — the fastest of any planet.",
    stats: [
      { label: "Distance from Sun", value: "57.9 million km", icon: "☀️" },
      { label: "Diameter", value: "4,880 km", note: "38% of Earth", icon: "📏" },
      { label: "Mass", value: "3.3 × 10²³ kg", note: "5.5% of Earth", icon: "⚖️" },
      { label: "Surface Gravity", value: "3.7 m/s²", note: "38% of Earth's 9.8", icon: "⬇️" },
      { label: "Escape Velocity", value: "4.3 km/s", note: "vs Earth's 11.2 km/s", icon: "🚀" },
      { label: "Atmosphere", value: "Virtually none", note: "Trace Na, O₂, H₂", icon: "🌫️" },
      { label: "Day Temp (Sun side)", value: "430°C", icon: "🔥" },
      { label: "Night Temp (dark side)", value: "-180°C", icon: "❄️" },
      { label: "Magnetic Field", value: "~1% of Earth's", icon: "🧲" },
    ],
    keyContext: [
      "Mercury has almost NO atmosphere — just traces of sodium and oxygen captured temporarily from solar wind.",
      "Despite being closest to the Sun, it's NOT the hottest planet. That's Venus.",
      "The temperature swing between day and night is over 600°C — the largest in the solar system.",
      "Mercury's low mass means low gravity, which directly affects how easily gases can escape."
    ],
    thinkAbout: "Why can't Mercury hold onto an atmosphere? Think about the relationship between gravity, temperature, and gas molecules."
  },

  venus: {
    subtitle: "Earth's Evil Twin",
    overview: "Venus is nearly the same size as Earth but has a radically different atmosphere — a crushing, toxic blanket of CO₂ that makes it the hottest planet in the solar system.",
    stats: [
      { label: "Distance from Sun", value: "108.2 million km", note: "1.87× farther than Mercury", icon: "☀️" },
      { label: "Diameter", value: "12,104 km", note: "95% of Earth", icon: "📏" },
      { label: "Surface Gravity", value: "8.87 m/s²", note: "91% of Earth", icon: "⬇️" },
      { label: "Atmosphere Composition", value: "96.5% CO₂, 3.5% N₂", icon: "🌫️" },
      { label: "Atmospheric Pressure", value: "92 atm", note: "92× Earth's surface!", icon: "💨" },
      { label: "Surface Temperature", value: "465°C average", note: "Hotter than Mercury!", icon: "🔥" },
      { label: "Day/Night Temp Difference", value: "Almost zero", note: "~5°C variation", icon: "🌡️" },
      { label: "Mercury's Max Temp", value: "430°C", note: "For comparison", icon: "🪨" },
    ],
    keyContext: [
      "Venus is FARTHER from the Sun than Mercury, yet its surface is 35°C HOTTER.",
      "Venus's atmosphere is 96.5% carbon dioxide — a powerful greenhouse gas.",
      "The atmospheric pressure on Venus is 92× Earth's — like being 900m underwater.",
      "Day and night temperatures are almost identical on Venus. Something is distributing and trapping heat evenly."
    ],
    thinkAbout: "Mercury is closer to the Sun but cooler. Venus has a thick CO₂ atmosphere. What is CO₂ doing to the heat?"
  },

  earth: {
    subtitle: "The Blue Marble",
    overview: "Earth is the only planet with liquid surface water, a breathable atmosphere, and a large Moon that creates significant ocean tides.",
    stats: [
      { label: "Distance from Sun", value: "149.6 million km (1 AU)", icon: "☀️" },
      { label: "Moon Distance", value: "384,400 km", note: "Drifting 3.8cm/yr farther", icon: "🌙" },
      { label: "Moon Mass", value: "7.3 × 10²² kg", note: "1.2% of Earth", icon: "⚖️" },
      { label: "Current Tidal Range", value: "~1m open ocean", note: "Up to 16m in bays", icon: "🌊" },
      { label: "Tidal Force Law", value: "∝ 1/d³", note: "Inverse CUBE, not square", icon: "📐" },
      { label: "Ocean Coverage", value: "71% of surface", icon: "💧" },
      { label: "Coastal Population", value: "~40% of humans", note: "Within 100km of coast", icon: "🏙️" },
    ],
    keyContext: [
      "Tidal force follows an INVERSE CUBE law (1/d³), not the regular inverse square law of gravity (1/d²).",
      "This means tides are MUCH more sensitive to distance changes than regular gravitational pull.",
      "The Moon is slowly moving away from Earth at 3.8 cm per year — tides are getting weaker over millions of years.",
      "About 40% of the world's population lives within 100km of a coastline."
    ],
    thinkAbout: "If distance is halved, normal gravity gets 4× stronger (2²). But tidal force uses the CUBE. What's 2³?"
  },

  mars: {
    subtitle: "The Red Planet",
    overview: "Mars is the most Earth-like planet, making it the top candidate for human colonization — but its thin atmosphere and toxic soil present major challenges.",
    stats: [
      { label: "Distance from Sun", value: "227.9 million km", icon: "☀️" },
      { label: "Atmosphere", value: "95% CO₂, 2.7% N₂", icon: "🌫️" },
      { label: "Atmospheric Pressure", value: "0.6% of Earth's", note: "~6 millibars", icon: "💨" },
      { label: "Surface Temperature", value: "-60°C average", note: "Range: -140 to 20°C", icon: "🌡️" },
      { label: "Surface Gravity", value: "3.72 m/s²", note: "38% of Earth", icon: "⬇️" },
      { label: "Soil (Regolith)", value: "Iron oxide, perchlorates", note: "0.5-1% toxic ClO₄⁻", icon: "🔬" },
      { label: "Water", value: "Ice at poles & underground", note: "No stable liquid on surface", icon: "💧" },
      { label: "UV Radiation", value: "~5× Earth's surface", note: "No ozone layer", icon: "☢️" },
      { label: "Nitrogen in Soil", value: "Almost none", note: "Critical plant nutrient", icon: "🧫" },
    ],
    keyContext: [
      "Mars has an atmosphere, but it's only 0.6% as dense as Earth's — too thin for liquid water to exist on the surface.",
      "The soil contains perchlorates (ClO₄⁻) at 0.5-1% — toxic to humans and plants even at low concentrations.",
      "Mars has no global magnetic field and no ozone layer, so UV radiation hits the surface at lethal levels.",
      "Water exists as ice at the poles and underground, but the low pressure means it sublimates (ice → gas) rather than melting."
    ],
    thinkAbout: "Plants need: nutrients in soil, water, atmospheric pressure, and protection from radiation. Which of these does Mars lack?"
  },

  jupiter: {
    subtitle: "King of the Planets",
    overview: "Jupiter is a gas giant with no solid surface, an incredibly fast rotation, and a storm (the Great Red Spot) that has raged for centuries.",
    stats: [
      { label: "Diameter", value: "139,820 km", note: "11× Earth", icon: "📏" },
      { label: "Mass", value: "1.9 × 10²⁷ kg", note: "318× Earth", icon: "⚖️" },
      { label: "Rotation Period", value: "9 hr 56 min", note: "Fastest spinning planet", icon: "🔄" },
      { label: "Surface", value: "None — gas all the way down", note: "Hydrogen & helium", icon: "🌀" },
      { label: "Great Red Spot Size", value: "~16,000 km wide", note: "Bigger than Earth!", icon: "🔴" },
      { label: "GRS Age", value: "350+ years observed", note: "Possibly much older", icon: "⏳" },
      { label: "Heat Output", value: "1.7× solar input", note: "Radiates more than it receives", icon: "🔥" },
      { label: "Wind Speeds", value: "Up to 620 km/h", icon: "💨" },
      { label: "Earth Hurricane Lifespan", value: "~1-2 weeks max", note: "For comparison", icon: "🌍" },
    ],
    keyContext: [
      "Jupiter has NO solid surface — there's no land for storms to make landfall and lose energy to friction.",
      "Jupiter radiates 1.7× more energy than it receives from the Sun — it has a powerful internal heat source.",
      "A day on Jupiter is only ~10 hours, creating extreme Coriolis forces that stabilize rotating storm systems.",
      "Earth hurricanes die when they hit land or lose their warm ocean heat source. Jupiter has neither limitation."
    ],
    thinkAbout: "On Earth, storms die from landfall friction and losing heat. Jupiter has no land and generates its own heat. What happens to storms?"
  },

  saturn: {
    subtitle: "The Ringed Beauty",
    overview: "Saturn is famous for its spectacular ring system — thousands of ringlets made of ice and rock orbiting within a critical gravitational boundary.",
    stats: [
      { label: "Diameter", value: "116,460 km", note: "9.5× Earth", icon: "📏" },
      { label: "Ring Span", value: "282,000 km wide", note: "But only ~10m thick!", icon: "🪐" },
      { label: "Ring Composition", value: "~93% water ice, 7% rock", icon: "💎" },
      { label: "Ring Particle Sizes", value: "Dust to house-sized", icon: "🪨" },
      { label: "Roche Limit", value: "~2.44 Saturn radii", note: "~147,000 km from center", icon: "⚠️" },
      { label: "Number of Moons", value: "146+ confirmed", note: "All outside Roche limit", icon: "🌕" },
      { label: "Ring Mass", value: "~40% of Mimas", note: "Mimas is a small moon", icon: "⚖️" },
      { label: "Rings Inside Roche Limit?", value: "Yes — entirely", icon: "📐" },
    ],
    keyContext: [
      "ALL of Saturn's rings orbit INSIDE the Roche limit — the distance where tidal forces overpower self-gravity.",
      "ALL of Saturn's 146+ moons orbit OUTSIDE the Roche limit — where self-gravity can hold objects together.",
      "The Roche limit is where two forces compete: the object's self-gravity (pulling together) vs Saturn's tidal forces (pulling apart).",
      "The rings are incredibly thin — if Saturn were the size of a football field, the rings would be thinner than a razor blade."
    ],
    thinkAbout: "Rings inside a boundary, moons outside it. What is this boundary, and what two forces determine it?"
  },

  uranus: {
    subtitle: "The Sideways Planet",
    overview: "Uranus is an ice giant that rotates on its side — a 98° axial tilt that makes it unique in the solar system. Something catastrophic must have happened.",
    stats: [
      { label: "Diameter", value: "50,724 km", note: "4× Earth", icon: "📏" },
      { label: "Axial Tilt", value: "97.77°", note: "Essentially rolling on its side", icon: "📐" },
      { label: "Earth's Axial Tilt", value: "23.5°", note: "For comparison", icon: "🌍" },
      { label: "Rotation Period", value: "17.24 hours", note: "Retrograde (backwards!)", icon: "🔄" },
      { label: "Magnetic Field Tilt", value: "59° from rotation axis", note: "Very unusual", icon: "🧲" },
      { label: "Composition", value: "H₂, He, methane ice", note: "Methane gives blue-green color", icon: "🫧" },
      { label: "Internal Heat", value: "Very low", note: "Unlike Neptune", icon: "🌡️" },
      { label: "Solar System Age", value: "~4.6 billion years", note: "Chaotic early period", icon: "⏳" },
    ],
    keyContext: [
      "Most planets spin roughly upright (within ~30° tilt). Uranus spins at 98° — practically on its side.",
      "Its magnetic field is also tilted 59° from the rotation axis — another sign of a violent history.",
      "The early solar system (first ~500 million years) was chaotic — dozens of protoplanets collided regularly.",
      "Angular momentum is CONSERVED — once an object's spin axis changes, it stays changed unless another force acts on it."
    ],
    thinkAbout: "What could knock an entire planet onto its side? And what law of physics explains why it stayed that way?"
  },

  neptune: {
    subtitle: "The Windswept World",
    overview: "Neptune is the farthest planet, receiving very little sunlight — yet it has the fastest winds in the entire solar system. A thermodynamic paradox.",
    stats: [
      { label: "Distance from Sun", value: "4.5 billion km", note: "30× Earth's distance", icon: "☀️" },
      { label: "Solar Energy Received", value: "1/900th of Earth's", note: "Very dark and cold", icon: "💡" },
      { label: "Energy Radiated", value: "2.61× solar input", note: "Radiates MORE than it gets!", icon: "📡" },
      { label: "Wind Speeds", value: "Up to 2,100 km/h", note: "Fastest in solar system", icon: "💨" },
      { label: "Earth's Max Wind", value: "~400 km/h", note: "Strongest tornado", icon: "🌍" },
      { label: "Surface", value: "None — gas/ice giant", note: "No solid surface friction", icon: "🌀" },
      { label: "Internal Temperature", value: "~5,100°C at core", note: "Very hot inside", icon: "🔥" },
      { label: "Atmosphere", value: "H₂, He, methane", note: "Methane = blue color", icon: "🌫️" },
    ],
    keyContext: [
      "Neptune radiates 2.61× more energy than it receives from the Sun — it has a massive internal heat source.",
      "This extra energy comes from gravitational contraction (Kelvin-Helmholtz mechanism) and possibly methane compressed into diamonds.",
      "Neptune has no solid surface — once winds start, there's almost zero friction to slow them down.",
      "Less solar input means fewer competing weather patterns — the atmosphere can organize into powerful, uniform circulation."
    ],
    thinkAbout: "Neptune gets almost no solar energy yet has 2,100 km/h winds. Where is the energy coming from, and why doesn't friction stop it?"
  }
};