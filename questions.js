
const PLANETS = [
  { name: "Mercury", color: [180, 170, 160], r: 18, dist: 100 },
  { name: "Venus",   color: [230, 190, 100], r: 24, dist: 200 },
  { name: "Earth",   color: [70, 130, 230],  r: 26, dist: 310 },
  { name: "Mars",    color: [200, 80, 50],   r: 22, dist: 410 },
  { name: "Jupiter", color: [210, 170, 110], r: 50, dist: 560 },
  { name: "Saturn",  color: [220, 202, 130], r: 42, dist: 720, ring: true },
  { name: "Uranus",  color: [140, 210, 220], r: 34, dist: 870 },
  { name: "Neptune", color: [60, 80, 200],   r: 32, dist: 1010 },
  { name: "Pluto",   color: [180, 170, 200], r: 14, dist: 1150 },
]

const PLANET_META = [
  { topic: "Basic Astronomy Foundations",         difficulty: "Easy",       o2Penalty: 12,  pluto: false },
  { topic: "Tools of Astronomy & Atmospheres",    difficulty: "Mild",       o2Penalty: 14,  pluto: false },
  { topic: "Earth-Moon-Sun System",               difficulty: "Mild",       o2Penalty: 14,  pluto: false },
  { topic: "Space Exploration & Engineering",     difficulty: "Medium",     o2Penalty: 16,  pluto: false },
  { topic: "Gravity & Moons in Space",            difficulty: "Medium",     o2Penalty: 16,  pluto: false },
  { topic: "Solar System Structure",              difficulty: "Medium",     o2Penalty: 18,  pluto: false },
  { topic: "Astrophysics & Ice Giants",           difficulty: "Hard",       o2Penalty: 22,  pluto: false },
  { topic: "Exoplanets & Astrobiology",           difficulty: "Hard",       o2Penalty: 22,  pluto: false },
  { topic: "Ultimate Frontier",                   difficulty: "Sudden Death", o2Penalty: 100, pluto: true  },
]

const QUESTIONS = [
  // ── Mercury ──────────────────────────────────────────────────
  [
    {
      type: "mc",
      q: "What is the closest star to Earth?",
      choices: ["The Sun", "Proxima Centauri", "Sirius", "Alpha Centauri A"],
      answer: 0,
      explain: "The Sun is ~8 light-minutes away; Proxima Centauri is 4.24 light-years.",
    },
    {
      type: "mc",
      q: "Roughly how old is our Sun?",
      choices: ["1 billion years", "4.6 billion years", "10 billion years", "800 million years"],
      answer: 1,
      explain: "The Sun formed ~4.6 billion years ago from a collapsing molecular cloud.",
    },
    {
      type: "sensor",
      sensor: "accelerometer",
      q: "Hold your device flat (screen up) for 3 sec to stabilize in zero-G. Keep Z-accel near 9.8 m/s².",
      threshold: { axis: "z", min: 8.0, max: 11.5, duration: 3000 },
      fallbackQ: "What force keeps planets in orbit around the Sun?",
      fallbackChoices: ["Magnetism", "Centrifugal force", "Gravity", "Dark energy"],
      fallbackAnswer: 2,
      explain: "Gravity governs orbital mechanics. Accelerometers read ~9.8 m/s² from Earth's gravity.",
    },
  ],
  // ── Venus ────────────────────────────────────────────────────
  [
    {
      type: "mc",
      q: "Which instrument disperses starlight into component wavelengths to reveal chemical composition?",
      choices: ["Telescope", "Magnetometer", "Barometer", "Spectrograph"],
      answer: 3,
      explain: "A spectrograph splits light into a spectrum revealing absorption lines of elements.",
    },
    {
      type: "mc",
      q: "Venus's atmosphere is over 96% CO₂. What is its approximate surface temperature?",
      choices: ["120°C", "260°C", "465°C", "700°C"],
      answer: 2,
      explain: "Venus's greenhouse effect makes it hotter than Mercury despite being farther from the Sun.",
    },
    {
      type: "sensor",
      sensor: "gyroscope",
      q: "Rotate your device 90° left — like adjusting a telescope. Tilt until γ ≈ 90° and hold 2 sec.",
      threshold: { axis: "gamma", min: 60, max: 120, duration: 2000 },
      fallbackQ: "What type of telescope uses mirrors to gather light?",
      fallbackChoices: ["Refractor", "Reflector", "Radio", "Infrared"],
      fallbackAnswer: 1,
      explain: "Reflector telescopes use concave mirrors to gather and focus light.",
    },
  ],
  // ── Earth ────────────────────────────────────────────────────
  [
    {
      type: "mc",
      q: "What primarily causes ocean tides on Earth?",
      choices: ["Earth's rotation alone", "Solar wind", "Gravitational pull of Moon and Sun", "Deep ocean currents"],
      answer: 2,
      explain: "Tidal forces come mainly from the Moon, with the Sun contributing ~46%.",
    },
    {
      type: "mc",
      q: "During a total solar eclipse, which body passes between the other two?",
      choices: ["Earth between Sun and Moon", "Moon between Sun and Earth", "Sun between Earth and Moon", "They form a triangle"],
      answer: 1,
      explain: "The Moon passes between Sun and Earth, casting its shadow on Earth.",
    },
    {
      type: "sensor",
      sensor: "orientation",
      q: "Point your device North (compass ≈ 0° ±30°) to calibrate navigation. Hold 2 sec.",
      threshold: { heading: 0, tolerance: 30, duration: 2000 },
      fallbackQ: "Earth's ~23.5° axial tilt causes which phenomenon?",
      fallbackChoices: ["Seasons", "Tides", "Day/night cycles", "Magnetic reversals"],
      fallbackAnswer: 0,
      explain: "The 23.5° tilt causes varying sunlight through the year, creating seasons.",
    },
  ],
  // ── Mars ─────────────────────────────────────────────────────
  [
    {
      type: "mc",
      q: "Which rover carried the Ingenuity helicopter — first powered flight on another world?",
      choices: ["Curiosity", "Opportunity", "Perseverance", "Spirit"],
      answer: 2,
      explain: "Perseverance landed Feb 2021; Ingenuity flew April 19, 2021.",
    },
    {
      type: "mc",
      q: "The main engineering challenge for crewed Mars missions during the 6–9 month trip is:",
      choices: ["Cosmic & solar radiation exposure", "Fuel weight", "Signal delay", "Food storage"],
      answer: 0,
      explain: "Astronauts face prolonged radiation requiring advanced shielding solutions.",
    },
    {
      type: "sensor",
      sensor: "accelerometer",
      q: "Simulate Mars landing: tilt device nose-down (β ≈ 30–50°) like a deceleration burn. Hold 2 sec.",
      threshold: { axis: "beta", min: 25, max: 55, duration: 2000 },
      fallbackQ: "Mars surface gravity is approximately what % of Earth's?",
      fallbackChoices: ["About 10%", "About 38%", "About 62%", "About 85%"],
      fallbackAnswer: 1,
      explain: "Mars gravity is ~3.72 m/s² — about 38% of Earth's 9.81 m/s².",
    },
  ],
  // ── Jupiter ──────────────────────────────────────────────────
  [
    {
      type: "mc",
      q: "Jupiter's moon Europa likely harbors:",
      choices: ["Active surface volcanoes", "A subsurface liquid water ocean", "A thick oxygen atmosphere", "Rare mineral deposits"],
      answer: 1,
      explain: "Europa's icy crust likely covers a global saltwater ocean — prime for life.",
    },
    {
      type: "mc",
      q: "The Roche limit is the distance within which:",
      choices: ["A moon's orbit circularizes", "Atmosphere begins ", "Light can't escape", "Tidal forces disintegrate a satellite"],
      answer: 3,
      explain: "Inside the Roche limit, tidal forces exceed the satellite's self-gravity.",
    },
    {
      type: "mc",
      q: "Jupiter's Great Red Spot has been observed for approximately:",
      choices: ["~50 years", "~150 years", "~350+ years", "~1 billion years"],
      answer: 2,
      explain: "Observed since at least 1664, the spot has been shrinking in recent decades.",
    },
  ],
  // ── Saturn ───────────────────────────────────────────────────
  [
    {
      type: "mc",
      q: "Saturn's rings are primarily composed of:",
      choices: ["Rock and metal", "Frozen gas and plasma", "Water ice and rocky debris", "Liquid methane"],
      answer: 2,
      explain: "Saturn's rings are ~99.9% water ice with trace rocky impurities.",
    },
    {
      type: "mc",
      q: "The Kuiper Belt is analogous to which inner solar system structure?",
      choices: ["The Oort Cloud", "The asteroid belt", "The heliopause", "Solar corona"],
      answer: 1,
      explain: "Both are debris fields — asteroid belt has rocky bodies; Kuiper Belt has icy ones.",
    },
    {
      type: "sensor",
      sensor: "gyroscope",
      q: "Saturn's axial tilt is ~26.7°. Tilt your device to ~25° (β ≈ 20–35°) and hold 2 sec.",
      threshold: { axis: "beta", min: 20, max: 35, duration: 2000 },
      fallbackQ: "Enceladus and Dione's orbital resonance is:",
      fallbackChoices: ["1:1", "3:5", "2:3", "1:2"],
      fallbackAnswer: 3,
      explain: "Enceladus orbits twice per Dione orbit (1:2). Tidal heating powers its geysers.",
    },
  ],
  // ── Uranus ───────────────────────────────────────────────────
  [
    {
      type: "mc",
      q: "Uranus's extreme ~98° axial tilt is best explained by:",
      choices: ["Strong solar winds", "A giant impact early in history", "Magnetic interactions with Neptune", "Jupiter resonance"],
      answer: 1,
      explain: "A collision with an Earth-sized protoplanet likely knocked Uranus onto its side.",
    },
    {
      type: "mc",
      q: "What makes Uranus and Neptune 'ice giants' vs 'gas giants'?",
      choices: ["Interiors dominated by water/ammonia/methane ices", "They're colder", "They have solid surfaces", "No magnetic fields"],
      answer: 0,
      explain: "Ice giant mantles contain supercritical water–ammonia–methane under extreme pressure.",
    },
    {
      type: "sensor",
      sensor: "accelerometer",
      q: "Uranus spins on its side! Rotate device sideways (γ ≈ 60–120°) and hold 2 sec.",
      threshold: { axis: "gamma", min: 60, max: 120, duration: 2000 },
      fallbackQ: "Uranus's blue-green color comes from which gas?",
      fallbackChoices: ["Oxygen", "Carbon dioxide", "Nitrogen", "Methane"],
      fallbackAnswer: 3,
      explain: "Methane absorbs red wavelengths, reflecting blue-green light.",
    },
  ],
  // ── Neptune ──────────────────────────────────────────────────
  [
    {
      type: "mc",
      q: "The habitable zone is defined as where:",
      choices: ["Planets form rings", "Solar wind is weakest", "Magnetic fields are strongest", "Liquid water can exist on a surface"],
      answer: 3,
      explain: "The habitable zone allows temperatures for liquid surface water.",
    },
    {
      type: "mc",
      q: "The Drake Equation estimates:",
      choices: ["Age of universe", "Mass of dark matter", "Communicative civilizations in our galaxy", "Distance to nearest exoplanet"],
      answer: 2,
      explain: "Drake's 1961 equation estimates N — the number of contactable civilizations.",
    },
    {
      type: "mc",
      q: "Which detection method finds most exoplanets via periodic stellar brightness dips?",
      choices: ["Transit photometry", "Radial velocity", "Direct imaging", "Gravitational microlensing"],
      answer: 0,
      explain: "Transit photometry (Kepler/TESS) detects planets crossing their host stars.",
    },
  ],
  // ── Pluto ────────────────────────────────────────────────────
  [
    {
      type: "mc",
      q: "Which IAU planet criterion does Pluto fail?",
      choices: ["Orbits the Sun", "Hydrostatic equilibrium", "Cleared its orbital neighborhood", "Has at least one moon"],
      answer: 2,
      explain: "Pluto shares its orbit with many Kuiper Belt objects.",
    },
    {
      type: "sensor",
      sensor: "orientation",
      q: "⚠️ CRITICAL: Point device due South (compass ~180° ±25°) to lock Pluto's orbital plane. Hold 3 sec. ONE mistake = INSTANT FREEZE.",
      threshold: { heading: 180, tolerance: 25, duration: 3000 },
      fallbackQ: "Pluto's heart-shaped Tombaugh Regio is primarily:",
      fallbackChoices: ["Water ice", "Nitrogen ice", "CO₂ ice", "Methane ice"],
      fallbackAnswer: 1,
      explain: "Sputnik Planitia is a vast basin of nitrogen ice with convective overturn.",
    },
    {
      type: "mc",
      q: "Could a rogue planet with subsurface ocean heated by radioactive decay support life?",
      choices: ["No, sunlight is required", "Yes, but only plants", "No, liquid water needs a star", "Yes, chemosynthetic life near vents"],
      answer: 3,
      explain: "Earth's deep-sea vents host life via chemosynthesis without sunlight.",
    },
  ],
]
