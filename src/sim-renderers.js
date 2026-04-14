// ============================================================
// src/sim-renderers.js — Renders interactive simulation widgets
// Each function creates a self-contained interactive widget
// inside a given container element.
// ============================================================

// Master renderer — routes to the correct simulation
export function renderSimulation(toolId, container) {
  container.innerHTML = '';
  const renderer = renderers[toolId];
  if (renderer) {
    renderer(container);
  } else {
    container.innerHTML = `<p style="color:#8892b0;text-align:center;padding:1rem;">Simulation coming soon!</p>`;
  }
}

// ============================================================
// MERCURY SIMULATIONS
// ============================================================

function mercuryGravitySlider(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🎯 Gravity Well Launcher</h4>
      <p class="sim-desc">Launch a gas molecule upward. Can it escape Mercury's gravity?</p>
      <div class="sim-canvas" id="grav-canvas">
        <div class="grav-planet" id="grav-planet">🪨</div>
        <div class="grav-molecule" id="grav-molecule">⚛️</div>
        <div class="grav-escape-line"><span>Escape velocity: 4.3 km/s</span></div>
      </div>
      <div class="sim-controls">
        <label>Launch Speed: <strong id="grav-speed-val">3.0</strong> km/s</label>
        <input type="range" id="grav-speed" min="1" max="8" step="0.1" value="3.0" />
        <div class="sim-row">
          <button class="sim-btn" id="grav-launch">🚀 Launch!</button>
          <span class="sim-result" id="grav-result"></span>
        </div>
      </div>
      <p class="sim-insight" id="grav-insight"></p>
    </div>
  `;

  const slider = el.querySelector('#grav-speed');
  const speedVal = el.querySelector('#grav-speed-val');
  const molecule = el.querySelector('#grav-molecule');
  const launchBtn = el.querySelector('#grav-launch');
  const result = el.querySelector('#grav-result');
  const insight = el.querySelector('#grav-insight');

  slider.addEventListener('input', () => {
    speedVal.textContent = parseFloat(slider.value).toFixed(1);
  });

  launchBtn.addEventListener('click', () => {
    const speed = parseFloat(slider.value);
    const escapes = speed >= 4.3;
    molecule.style.transition = 'transform 1.2s ease-out, opacity 1s ease-out';
    molecule.style.transform = escapes ? 'translateY(-200px)' : 'translateY(-80px)';
    molecule.style.opacity = escapes ? '0' : '1';

    result.textContent = escapes ? '✅ Escaped!' : '❌ Fell back down';
    result.style.color = escapes ? '#66bb6a' : '#ef5350';

    if (escapes) {
      insight.textContent = `At ${speed} km/s the molecule exceeds Mercury's escape velocity (4.3 km/s) and flies off into space!`;
    } else {
      insight.textContent = `At ${speed} km/s the molecule doesn't reach escape velocity. Mercury's gravity pulls it back - but barely. On Earth you'd need 11.2 km/s!`;
    }

    setTimeout(() => {
      molecule.style.transition = 'transform 0.4s ease-in';
      molecule.style.transform = 'translateY(0)';
      molecule.style.opacity = '1';
    }, 1800);
  });
}

function mercuryEscapeVelocity(el) {
  const planets = [
    { name: 'Mercury', ev: 4.3, color: '#b0b0b0', emoji: '🪨' },
    { name: 'Venus', ev: 10.4, color: '#e8a735', emoji: '🌋' },
    { name: 'Earth', ev: 11.2, color: '#4a90d9', emoji: '🌍' },
    { name: 'Mars', ev: 5.0, color: '#d44a2e', emoji: '🔴' },
    { name: 'Jupiter', ev: 59.5, color: '#d4915e', emoji: '🟠' },
    { name: 'Moon', ev: 2.4, color: '#ccc', emoji: '🌙' },
  ];
  const maxEV = 60;

  let bars = planets.map(p => {
    const pct = (p.ev / maxEV) * 100;
    return `<div class="ev-row">
      <span class="ev-label">${p.emoji} ${p.name}</span>
      <div class="ev-bar-track"><div class="ev-bar-fill" style="width:${pct}%;background:${p.color}"></div></div>
      <span class="ev-val">${p.ev} km/s</span>
    </div>`;
  }).join('');

  el.innerHTML = `
    <div class="sim-widget">
      <h4>🚀 Escape Velocity Comparison</h4>
      <p class="sim-desc">Compare how fast a molecule must move to escape each body's gravity.</p>
      <div class="ev-chart">${bars}</div>
      <p class="sim-insight">Notice: Mercury's escape velocity is only 4.3 km/s - gas molecules heated by the Sun easily reach this speed and fly away! That's why Mercury can't hold an atmosphere.</p>
    </div>
  `;
}

function mercurySolarWind(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>☀️ Solar Wind Visualizer</h4>
      <p class="sim-desc">Mercury has a very weak magnetic field. Toggle the solar wind to see what happens.</p>
      <div class="sim-canvas solar-wind-canvas" id="sw-canvas">
        <div class="sw-sun">☀️</div>
        <div class="sw-particles" id="sw-particles"></div>
        <div class="sw-planet" id="sw-planet">🪨</div>
        <div class="sw-atmo" id="sw-atmo"></div>
      </div>
      <div class="sim-controls">
        <label class="sim-toggle-label">
          <input type="checkbox" id="sw-toggle" checked /> Solar Wind Active
        </label>
        <div class="sim-row">
          <span class="sim-result" id="sw-result">Atmosphere being stripped away...</span>
        </div>
      </div>
      <p class="sim-insight">Mercury's magnetic field is only ~1% as strong as Earth's. It can't deflect the solar wind, which blasts away any gas that accumulates.</p>
    </div>
  `;

  const toggle = el.querySelector('#sw-toggle');
  const atmo = el.querySelector('#sw-atmo');
  const result = el.querySelector('#sw-result');
  const particles = el.querySelector('#sw-particles');

  function update() {
    if (toggle.checked) {
      atmo.style.opacity = '0.1';
      atmo.style.transform = 'scale(0.9)';
      particles.classList.add('active');
      result.textContent = '💨 Solar wind active - atmosphere being stripped away!';
      result.style.color = '#ef5350';
    } else {
      atmo.style.opacity = '0.6';
      atmo.style.transform = 'scale(1.1)';
      particles.classList.remove('active');
      result.textContent = '🛡️ Solar wind off - thin atmosphere slowly builds up.';
      result.style.color = '#66bb6a';
    }
  }

  toggle.addEventListener('change', update);
  update();
}

// ============================================================
// VENUS SIMULATIONS
// ============================================================

function venusAtmosphereLayers(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🌫️ Atmosphere Builder</h4>
      <p class="sim-desc">Add CO₂ layers and watch the surface temperature rise.</p>
      <div class="sim-canvas atmo-canvas">
        <div class="atmo-temp-display">🌡️ <strong id="atmo-temp">150</strong>°C</div>
        <div class="atmo-planet-wrap">
          <div class="atmo-layers" id="atmo-layers"></div>
          <div class="atmo-surface">🌋</div>
        </div>
      </div>
      <div class="sim-controls">
        <label>CO₂ Layers: <strong id="atmo-layer-count">2</strong></label>
        <input type="range" id="atmo-slider" min="0" max="10" step="1" value="2" />
      </div>
      <p class="sim-insight" id="atmo-insight">Each layer traps more outgoing infrared radiation. Venus has the equivalent of ~10 extreme layers!</p>
    </div>
  `;

  const slider = el.querySelector('#atmo-slider');
  const temp = el.querySelector('#atmo-temp');
  const count = el.querySelector('#atmo-layer-count');
  const layersDiv = el.querySelector('#atmo-layers');
  const insight = el.querySelector('#atmo-insight');

  function update() {
    const layers = parseInt(slider.value);
    count.textContent = layers;
    // Temperature model: roughly exponential trap
    const t = Math.round(-50 + layers * layers * 5.15);
    temp.textContent = Math.max(-50, t);

    layersDiv.innerHTML = '';
    for (let i = 0; i < layers; i++) {
      const layer = document.createElement('div');
      layer.className = 'co2-layer';
      layer.style.opacity = 0.08 + i * 0.04;
      layersDiv.appendChild(layer);
    }

    if (layers === 0) insight.textContent = "No atmosphere - like Mercury! Heat escapes freely into space. Surface is cold at night.";
    else if (layers <= 3) insight.textContent = "A thin atmosphere traps some heat - like Mars. Mild greenhouse effect.";
    else if (layers <= 6) insight.textContent = "Getting warmer! This is past Earth-level greenhouse. CO₂ is really stacking up.";
    else insight.textContent = "🔥 RUNAWAY GREENHOUSE! This is Venus - so much CO₂ that almost no heat escapes. 465°C surface!";
  }

  slider.addEventListener('input', update);
  update();
}

function venusGreenhouseSim(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🌡️ Greenhouse Effect Simulator</h4>
      <p class="sim-desc">Watch solar energy enter and heat try to leave. CO₂ traps the outgoing infrared!</p>
      <div class="sim-canvas greenhouse-canvas">
        <div class="gh-sun-rays">☀️ → → →</div>
        <div class="gh-atmosphere" id="gh-atmo">
          <span class="gh-label">CO₂ Atmosphere</span>
        </div>
        <div class="gh-surface">
          <span>Surface: <strong id="gh-temp">465</strong>°C</span>
        </div>
        <div class="gh-ir-rays" id="gh-ir">↑ IR blocked ✋</div>
      </div>
      <div class="sim-controls">
        <label class="sim-toggle-label">
          <input type="checkbox" id="gh-toggle" checked /> Thick CO₂ Atmosphere
        </label>
      </div>
      <p class="sim-insight" id="gh-insight">With CO₂: sunlight gets in, but infrared heat can't get out → 465°C</p>
    </div>
  `;

  const toggle = el.querySelector('#gh-toggle');
  const atmo = el.querySelector('#gh-atmo');
  const ir = el.querySelector('#gh-ir');
  const temp = el.querySelector('#gh-temp');
  const insight = el.querySelector('#gh-insight');

  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      atmo.style.opacity = '1';
      ir.textContent = '↑ IR blocked ✋';
      ir.style.color = '#ef5350';
      temp.textContent = '465';
      insight.textContent = 'With thick CO₂: sunlight enters easily, but infrared radiation bounces back. Heat is trapped → 465°C!';
    } else {
      atmo.style.opacity = '0.15';
      ir.textContent = '↑ IR escapes freely ✅';
      ir.style.color = '#66bb6a';
      temp.textContent = '-40';
      insight.textContent = 'Without greenhouse gases: heat radiates away into space. Venus would be about -40°C — freezing!';
    }
  });
}

function venusPlanetCompare(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>⚖️ Mercury vs Venus Temperature</h4>
      <p class="sim-desc">Mercury is closer to the Sun but Venus is hotter. Why?</p>
      <div class="compare-grid">
        <div class="compare-card">
          <div class="compare-planet">🪨</div>
          <h5>Mercury</h5>
          <div class="compare-stat">Distance: <strong>0.39 AU</strong></div>
          <div class="compare-stat">Atmosphere: <strong style="color:#ef5350">Almost none</strong></div>
          <div class="compare-stat">Max Temp: <strong>430°C</strong> (day)</div>
          <div class="compare-stat">Min Temp: <strong>-180°C</strong> (night)</div>
          <div class="compare-verdict">❌ No heat trapping</div>
        </div>
        <div class="compare-vs">VS</div>
        <div class="compare-card" style="border-color:rgba(232,167,53,0.4)">
          <div class="compare-planet">🌋</div>
          <h5>Venus</h5>
          <div class="compare-stat">Distance: <strong>0.72 AU</strong></div>
          <div class="compare-stat">Atmosphere: <strong style="color:#e8a735">96% CO₂, 90x dense</strong></div>
          <div class="compare-stat">Surface: <strong style="color:#ef5350">465°C always</strong></div>
          <div class="compare-stat">Day/Night: <strong>Almost no difference</strong></div>
          <div class="compare-verdict" style="color:#e8a735">🔥 Runaway greenhouse</div>
        </div>
      </div>
      <p class="sim-insight">The atmosphere makes ALL the difference! Distance from the Sun matters less than what you do with the heat.</p>
    </div>
  `;
}

// ============================================================
// EARTH SIMULATIONS
// ============================================================

function earthMoonDistance(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🌙 Moon Distance Slider</h4>
      <p class="sim-desc">Drag the Moon closer and watch the tidal bulge grow!</p>
      <div class="sim-canvas moon-canvas">
        <div class="moon-earth">🌍</div>
        <div class="moon-tidal-bulge" id="moon-bulge"></div>
        <div class="moon-icon" id="moon-icon">🌙</div>
        <div class="moon-distance-label" id="moon-dist-label">384,400 km</div>
      </div>
      <div class="sim-controls">
        <label>Moon Distance: <strong id="moon-dist-val">1.0x</strong> current</label>
        <input type="range" id="moon-dist" min="0.3" max="2.0" step="0.05" value="1.0" />
        <div class="sim-row">
          <span>Tidal Force: <strong id="moon-force">1.0x</strong></span>
          <span>Tide Height: <strong id="moon-tide">~1m</strong></span>
        </div>
      </div>
      <p class="sim-insight" id="moon-insight">Current tides average about 1 meter in the open ocean.</p>
    </div>
  `;

  const slider = el.querySelector('#moon-dist');
  const distVal = el.querySelector('#moon-dist-val');
  const force = el.querySelector('#moon-force');
  const tide = el.querySelector('#moon-tide');
  const icon = el.querySelector('#moon-icon');
  const bulge = el.querySelector('#moon-bulge');
  const label = el.querySelector('#moon-dist-label');
  const insight = el.querySelector('#moon-insight');

  slider.addEventListener('input', () => {
    const d = parseFloat(slider.value);
    distVal.textContent = d.toFixed(2) + 'x';

    // Inverse cube law: force = 1/d³
    const f = 1 / (d * d * d);
    force.textContent = f.toFixed(1) + 'x';

    // Tide height proportional to force
    const h = f * 1;
    tide.textContent = h < 10 ? `~${h.toFixed(1)}m` : `~${Math.round(h)}m`;

    // Visual: moon position
    const moonPos = 20 + d * 35;
    icon.style.right = `${100 - moonPos}%`;
    label.textContent = `${Math.round(384400 * d).toLocaleString()} km`;

    // Bulge size
    const bulgeScale = Math.min(f * 0.5, 3);
    bulge.style.transform = `scaleX(${1 + bulgeScale})`;

    // Insight
    if (d <= 0.5) insight.textContent = `🌊 CATASTROPHIC! At half distance, tides are ${f.toFixed(0)}x stronger (~${Math.round(h)}m). Coastal cities submerged twice daily!`;
    else if (d <= 0.8) insight.textContent = `⚠️ Dangerously strong tides at ${f.toFixed(1)}x normal. Major flooding worldwide.`;
    else if (d <= 1.2) insight.textContent = `Near current distance. Tides are roughly what we experience today.`;
    else insight.textContent = `Moon farther away — weaker tides. This is actually happening! The Moon drifts ~3.8cm/year farther.`;
  });
}

function earthTidalMath(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>📐 Tidal Force Calculator</h4>
      <p class="sim-desc">The inverse cube law: Tidal Force ∝ 1/d³</p>
      <div class="math-display">
        <div class="math-formula">F<sub>tidal</sub> = <span class="math-frac"><span>2GMm</span><span>d³</span></span></div>
        <div class="math-interactive">
          <label>If distance is divided by: <strong id="math-divisor">2</strong></label>
          <input type="range" id="math-slider" min="1" max="5" step="0.5" value="2" />
          <div class="math-result">
            <span>New force = <strong id="math-result-val">8</strong>x original</span>
          </div>
          <div class="math-work" id="math-work">d/2 → (2)³ = 8 → Force is 8x stronger</div>
        </div>
      </div>
      <p class="sim-insight">This is why "twice as close" doesn't mean "twice the tides" — it means EIGHT times! The cube law makes tidal forces change rapidly with distance.</p>
    </div>
  `;

  const slider = el.querySelector('#math-slider');
  const divisor = el.querySelector('#math-divisor');
  const result = el.querySelector('#math-result-val');
  const work = el.querySelector('#math-work');

  slider.addEventListener('input', () => {
    const d = parseFloat(slider.value);
    divisor.textContent = d;
    const force = Math.pow(d, 3);
    result.textContent = force.toFixed(1);
    work.textContent = `d/${d} → (${d})³ = ${force.toFixed(1)} → Force is ${force.toFixed(1)}x stronger`;
  });
}

function earthFloodVisualizer(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🌊 Coastal Impact Simulator</h4>
      <p class="sim-desc">See what different tidal forces would do to a coastline.</p>
      <div class="flood-visual">
        <div class="flood-scene">
          <div class="flood-sky">🏙️</div>
          <div class="flood-water" id="flood-water"></div>
          <div class="flood-level-marker" id="flood-marker">Sea Level</div>
        </div>
      </div>
      <div class="sim-controls">
        <label>Tidal Multiplier: <strong id="flood-mult">1</strong>x</label>
        <input type="range" id="flood-slider" min="1" max="30" step="1" value="1" />
        <span class="sim-result" id="flood-result">Normal tides: ~1m range</span>
      </div>
      <p class="sim-insight" id="flood-insight">Normal tides rise about 1 meter. Even doubling would flood many beaches.</p>
    </div>
  `;

  const slider = el.querySelector('#flood-slider');
  const mult = el.querySelector('#flood-mult');
  const water = el.querySelector('#flood-water');
  const result = el.querySelector('#flood-result');
  const insight = el.querySelector('#flood-insight');

  slider.addEventListener('input', () => {
    const m = parseInt(slider.value);
    mult.textContent = m;
    const height = Math.min(20 + m * 2.5, 90);
    water.style.height = `${height}%`;

    if (m <= 2) { result.textContent = `~${m}m tides: Normal to slightly high.`; insight.textContent = 'This is close to what some coastal areas already experience.'; }
    else if (m <= 8) { result.textContent = `~${m}m tides: Major flooding!`; insight.textContent = `At ${m}x, coastal cities flood twice daily. This is what would happen if the Moon were about ${(1/Math.cbrt(m)).toFixed(1)}x its current distance.`; }
    else if (m <= 15) { result.textContent = `~${m}m tides: Catastrophic.`; insight.textContent = 'Most ports and coastal infrastructure would be destroyed. Millions displaced.'; }
    else { result.textContent = `~${m}m tides: Apocalyptic.`; insight.textContent = 'Tidal waves reaching inland for kilometers. Earth\'s coastlines would be unrecognizable.'; }
  });
}

// ============================================================
// MARS SIMULATIONS
// ============================================================

function marsSoilAnalyzer(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🔬 Soil Composition Scanner</h4>
      <p class="sim-desc">Click "Scan" to analyze what's in Martian regolith.</p>
      <div class="soil-results" id="soil-results">
        <div class="soil-bar-group">
          <div class="soil-item"><span>Iron Oxide (rust)</span><div class="soil-bar"><div class="soil-fill" style="width:43%;background:#d44a2e"></div></div><span>43%</span></div>
          <div class="soil-item"><span>Silicon Dioxide</span><div class="soil-bar"><div class="soil-fill" style="width:22%;background:#c4a84e"></div></div><span>22%</span></div>
          <div class="soil-item"><span>Magnesium Oxide</span><div class="soil-bar"><div class="soil-fill" style="width:7%;background:#66bb6a"></div></div><span>7%</span></div>
          <div class="soil-item"><span>Calcium Oxide</span><div class="soil-bar"><div class="soil-fill" style="width:6%;background:#e2e8f0"></div></div><span>6%</span></div>
          <div class="soil-item toxic"><span>⚠️ PERCHLORATES</span><div class="soil-bar"><div class="soil-fill" style="width:1%;background:#ef5350"></div></div><span>0.5-1%</span></div>
          <div class="soil-item"><span>Nitrogen compounds</span><div class="soil-bar"><div class="soil-fill" style="width:0%;background:#64b5f6"></div></div><span>~0%</span></div>
        </div>
      </div>
      <p class="sim-insight">⚠️ Perchlorates are toxic to humans at just 0.5%. And notice: almost NO nitrogen — a nutrient plants desperately need!</p>
    </div>
  `;
}

function marsPlantSurvival(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🌱 Plant Survival Lab</h4>
      <p class="sim-desc">Toggle conditions to see if your plant can survive on Mars!</p>
      <div class="plant-display">
        <div class="plant-icon" id="plant-icon">🌱</div>
        <div class="plant-status" id="plant-status">Status: ☠️ Dead</div>
      </div>
      <div class="plant-toggles">
        <label class="sim-toggle-label"><input type="checkbox" class="plant-check" data-cond="pressure" /> 🏠 Pressurized Dome</label>
        <label class="sim-toggle-label"><input type="checkbox" class="plant-check" data-cond="water" /> 💧 Water Supply</label>
        <label class="sim-toggle-label"><input type="checkbox" class="plant-check" data-cond="soil" /> 🧪 Perchlorate-Free Soil</label>
        <label class="sim-toggle-label"><input type="checkbox" class="plant-check" data-cond="uv" /> 🛡️ UV Radiation Shield</label>
        <label class="sim-toggle-label"><input type="checkbox" class="plant-check" data-cond="nutrients" /> 🧫 Added Nitrogen/Nutrients</label>
      </div>
      <p class="sim-insight" id="plant-insight">Plants need ALL five conditions to survive on Mars. Toggle each to see why!</p>
    </div>
  `;

  const checks = el.querySelectorAll('.plant-check');
  const icon = el.querySelector('#plant-icon');
  const status = el.querySelector('#plant-status');
  const insight = el.querySelector('#plant-insight');

  const reasons = {
    pressure: '❌ No pressure dome: atmosphere is ~0.6% of Earth\'s. Water boils, cells rupture.',
    water: '❌ No water: can\'t photosynthesize or transport nutrients.',
    soil: '❌ Perchlorates in soil: toxic compounds destroy plant cells.',
    uv: '❌ No UV shield: Mars has no ozone layer. UV radiation shreds DNA.',
    nutrients: '❌ No nitrogen: Martian soil lacks the nutrients plants need to grow.'
  };

  function update() {
    const active = {};
    checks.forEach(c => { active[c.dataset.cond] = c.checked; });
    const all = Object.values(active);
    const onCount = all.filter(Boolean).length;

    if (onCount === 5) {
      icon.textContent = '🌿';
      icon.style.fontSize = '4rem';
      status.textContent = 'Status: 🌿 Thriving!';
      status.style.color = '#66bb6a';
      insight.textContent = '✅ All conditions met! The plant can grow inside a Martian greenhouse with processed soil and added nutrients.';
    } else if (onCount >= 3) {
      icon.textContent = '🥀';
      icon.style.fontSize = '3rem';
      status.textContent = 'Status: 🥀 Struggling...';
      status.style.color = '#ffa726';
      const missing = Object.entries(active).filter(([k,v]) => !v).map(([k]) => reasons[k]);
      insight.textContent = missing[0];
    } else {
      icon.textContent = '💀';
      icon.style.fontSize = '3rem';
      status.textContent = 'Status: ☠️ Dead';
      status.style.color = '#ef5350';
      const missing = Object.entries(active).filter(([k,v]) => !v).map(([k]) => reasons[k]);
      insight.textContent = missing[0] || 'Too many missing conditions!';
    }
  }

  checks.forEach(c => c.addEventListener('change', update));
  update();
}

function marsRadiationShield(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>☢️ UV Radiation Comparison</h4>
      <p class="sim-desc">Mars has no ozone layer. Compare UV levels.</p>
      <div class="compare-grid">
        <div class="compare-card">
          <div class="compare-planet">🌍</div>
          <h5>Earth Surface</h5>
          <div class="compare-stat">Ozone Layer: <strong style="color:#66bb6a">Yes ✅</strong></div>
          <div class="compare-stat">UV Index: <strong>6-8</strong> (moderate)</div>
          <div class="compare-stat">DNA Damage: <strong>Low</strong></div>
        </div>
        <div class="compare-vs">VS</div>
        <div class="compare-card" style="border-color:rgba(212,74,46,0.4)">
          <div class="compare-planet">🔴</div>
          <h5>Mars Surface</h5>
          <div class="compare-stat">Ozone Layer: <strong style="color:#ef5350">None ❌</strong></div>
          <div class="compare-stat">UV Index: <strong style="color:#ef5350">40+</strong> (extreme)</div>
          <div class="compare-stat">DNA Damage: <strong style="color:#ef5350">Severe in minutes</strong></div>
        </div>
      </div>
      <p class="sim-insight">Without an ozone layer, Mars gets ~5x more UV radiation than Earth. Exposed plants (and humans) would suffer severe DNA damage within minutes.</p>
    </div>
  `;
}

// ============================================================
// JUPITER, SATURN, URANUS, NEPTUNE — Simulations
// ============================================================

function jupiterStormSimulator(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🌪️ Storm Decay Simulator</h4>
      <p class="sim-desc">Toggle conditions to see why the Great Red Spot persists.</p>
      <div class="storm-display">
        <div class="storm-icon" id="storm-icon">🌀</div>
        <div class="storm-status" id="storm-status">Storm: RAGING for 350+ years</div>
      </div>
      <div class="plant-toggles">
        <label class="sim-toggle-label"><input type="checkbox" class="storm-check" data-cond="surface" /> 🏔️ Add Solid Surface</label>
        <label class="sim-toggle-label"><input type="checkbox" class="storm-check" data-cond="heat" /> ❄️ Remove Internal Heat</label>
        <label class="sim-toggle-label"><input type="checkbox" class="storm-check" data-cond="spin" /> 🐌 Slow Rotation (24hr day)</label>
      </div>
      <p class="sim-insight" id="storm-insight">Jupiter: no surface friction + internal heat + rapid spin = eternal storms</p>
    </div>
  `;

  const checks = el.querySelectorAll('.storm-check');
  const icon = el.querySelector('#storm-icon');
  const status = el.querySelector('#storm-status');
  const insight = el.querySelector('#storm-insight');

  function update() {
    const active = {};
    checks.forEach(c => { active[c.dataset.cond] = c.checked; });
    const killCount = Object.values(active).filter(Boolean).length;

    if (killCount === 0) {
      icon.textContent = '🌀'; icon.style.fontSize = '4rem';
      status.textContent = 'Storm: 🌀 RAGING for 350+ years!'; status.style.color = '#ffa726';
      insight.textContent = 'No surface friction, constant internal heat, rapid 10-hour rotation → storm lives forever.';
    } else if (killCount === 1) {
      icon.textContent = '🌪️'; icon.style.fontSize = '3.5rem';
      status.textContent = 'Storm: 🌪️ Weakening...'; status.style.color = '#e8d282';
      if (active.surface) insight.textContent = 'A solid surface adds friction — storms lose energy when they hit land. This is why Earth hurricanes die over land!';
      if (active.heat) insight.textContent = 'Without internal heat, the storm loses its energy source. It would slowly starve.';
      if (active.spin) insight.textContent = 'Slower rotation weakens the Coriolis effect. The vortex becomes less stable and starts to wobble apart.';
    } else {
      icon.textContent = '💨'; icon.style.fontSize = '3rem';
      status.textContent = 'Storm: 💨 Dissipated!'; status.style.color = '#ef5350';
      insight.textContent = 'Multiple storm-killing factors active. The Great Red Spot wouldn\'t last more than a few weeks under these conditions — just like Earth hurricanes!';
    }
  }
  checks.forEach(c => c.addEventListener('change', update));
  update();
}

function jupiterHeatEngine(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🔥 Internal Heat Engine</h4>
      <p class="sim-desc">Jupiter radiates 1.7x more energy than it gets from the Sun!</p>
      <div class="sim-controls">
        <label>Internal Heat: <strong id="heat-val">170</strong>%</label>
        <input type="range" id="heat-slider" min="0" max="300" step="10" value="170" />
        <div class="heat-bars">
          <div class="heat-bar-row"><span>☀️ Solar In</span><div class="soil-bar"><div class="soil-fill" style="width:40%;background:#ffa726"></div></div><span>100%</span></div>
          <div class="heat-bar-row"><span>🔥 Total Out</span><div class="soil-bar"><div class="soil-fill" id="heat-out-bar" style="width:68%;background:#ef5350"></div></div><span id="heat-out-val">170%</span></div>
        </div>
      </div>
      <p class="sim-insight" id="heat-insight">The extra 70% comes from gravitational contraction — Jupiter is slowly shrinking and converting gravitational energy to heat!</p>
    </div>
  `;

  const slider = el.querySelector('#heat-slider');
  const val = el.querySelector('#heat-val');
  const outBar = el.querySelector('#heat-out-bar');
  const outVal = el.querySelector('#heat-out-val');
  const insight = el.querySelector('#heat-insight');

  slider.addEventListener('input', () => {
    const v = parseInt(slider.value);
    val.textContent = v;
    outVal.textContent = v + '%';
    outBar.style.width = Math.min(v / 3, 100) + '%';
    if (v <= 100) insight.textContent = 'At 100% or less, Jupiter only outputs what it gets from the Sun. No extra energy to drive storms.';
    else if (v <= 200) insight.textContent = `Outputting ${v}% — the extra ${v - 100}% comes from gravitational contraction (Kelvin-Helmholtz mechanism). This powers the atmosphere!`;
    else insight.textContent = `${v}% output! Massive internal heat. This is what drives Jupiter's wild atmospheric dynamics and persistent storms.`;
  });
}

function jupiterCoriolisSpin(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🔄 Coriolis Effect Spinner</h4>
      <p class="sim-desc">Faster rotation = stronger Coriolis = more stable vortices</p>
      <div class="sim-controls">
        <label>Day Length: <strong id="cor-val">10</strong> hours</label>
        <input type="range" id="cor-slider" min="5" max="48" step="1" value="10" />
        <div class="sim-row">
          <span>Coriolis Strength: <strong id="cor-strength">Very Strong</strong></span>
        </div>
        <div class="sim-row">
          <span>Vortex Stability: <strong id="cor-stability">Extremely Stable</strong></span>
        </div>
      </div>
      <p class="sim-insight" id="cor-insight">Jupiter's 10-hour day creates a Coriolis force ~2.4x stronger than Earth's. This locks storms into stable bands.</p>
    </div>
  `;

  const slider = el.querySelector('#cor-slider');
  const val = el.querySelector('#cor-val');
  const strength = el.querySelector('#cor-strength');
  const stability = el.querySelector('#cor-stability');
  const insight = el.querySelector('#cor-insight');

  slider.addEventListener('input', () => {
    const h = parseInt(slider.value);
    val.textContent = h;
    if (h <= 12) { strength.textContent = 'Very Strong'; strength.style.color='#66bb6a'; stability.textContent='Extremely Stable'; insight.textContent=`A ${h}-hour day means rapid rotation and powerful Coriolis forces. Storms form tight, stable vortices that can last centuries.`; }
    else if (h <= 24) { strength.textContent = 'Moderate'; strength.style.color='#ffa726'; stability.textContent='Somewhat Stable'; insight.textContent=`A ${h}-hour day (Earth-like). Coriolis is present but weaker. Storms last days to weeks, not centuries.`; }
    else { strength.textContent = 'Weak'; strength.style.color='#ef5350'; stability.textContent='Unstable'; insight.textContent=`A ${h}-hour day is very slow. Weak Coriolis means storms break apart quickly. Venus rotates in 243 days — it has no organized storm bands.`; }
  });
}

function saturnRocheLimit(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>💥 Roche Limit Visualizer</h4>
      <p class="sim-desc">Drag the moon toward Saturn. What happens at the Roche limit?</p>
      <div class="sim-canvas roche-canvas">
        <div class="roche-saturn">💍</div>
        <div class="roche-line" id="roche-line"><span>Roche Limit</span></div>
        <div class="roche-moon" id="roche-moon">🌕</div>
      </div>
      <div class="sim-controls">
        <label>Moon Distance: <strong id="roche-dist">3.0</strong> Saturn radii</label>
        <input type="range" id="roche-slider" min="1.0" max="4.0" step="0.1" value="3.0" />
        <span class="sim-result" id="roche-result">🌕 Moon is intact — outside the Roche limit</span>
      </div>
      <p class="sim-insight" id="roche-insight">The Roche limit for Saturn is about 2.44 Saturn radii. Rings exist inside this boundary.</p>
    </div>
  `;

  const slider = el.querySelector('#roche-slider');
  const dist = el.querySelector('#roche-dist');
  const moon = el.querySelector('#roche-moon');
  const result = el.querySelector('#roche-result');
  const insight = el.querySelector('#roche-insight');

  slider.addEventListener('input', () => {
    const d = parseFloat(slider.value);
    dist.textContent = d.toFixed(1);
    if (d > 2.44) {
      moon.textContent = '🌕';
      result.textContent = '🌕 Moon intact — self-gravity holds it together!';
      result.style.color = '#66bb6a';
      insight.textContent = `At ${d.toFixed(1)} radii, the moon is safely outside the Roche limit. Tidal forces are weaker than self-gravity.`;
    } else if (d > 2.0) {
      moon.textContent = '🪨💥';
      result.textContent = '💥 Moon breaking apart at the Roche limit!';
      result.style.color = '#ffa726';
      insight.textContent = 'Tidal forces now exceed self-gravity. The near side is pulled harder than the far side — the moon is being ripped apart!';
    } else {
      moon.textContent = '✨💫✨';
      result.textContent = '💫 Shattered into ring particles!';
      result.style.color = '#e8d282';
      insight.textContent = 'Deep inside the Roche limit — the moon is completely destroyed. The debris spreads into a ring of ice and rock fragments!';
    }
  });
}

function saturnRingComposition(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>💎 Ring Material Scanner</h4>
      <p class="sim-desc">Saturn's rings are surprisingly simple in composition.</p>
      <div class="soil-bar-group">
        <div class="soil-item"><span>Water Ice</span><div class="soil-bar"><div class="soil-fill" style="width:93%;background:#7de8e8"></div></div><span>~93%</span></div>
        <div class="soil-item"><span>Rocky Silicates</span><div class="soil-bar"><div class="soil-fill" style="width:7%;background:#b0b0b0"></div></div><span>~7%</span></div>
      </div>
      <div class="ring-facts">
        <div class="ring-fact">📏 Particle sizes: dust grain → house-sized</div>
        <div class="ring-fact">📐 Ring span: 282,000 km wide</div>
        <div class="ring-fact">📄 Ring thickness: only ~10 meters!</div>
        <div class="ring-fact">⚖️ Total mass: ~40% of Saturn's moon Mimas</div>
      </div>
      <p class="sim-insight">The rings are almost entirely water ice! They're incredibly wide but paper-thin. If Saturn were a football field, the rings would be thinner than a razor blade.</p>
    </div>
  `;
}

function saturnTidalForces(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🤜 Tidal Tug-of-War</h4>
      <p class="sim-desc">Two forces compete: self-gravity vs tidal disruption.</p>
      <div class="sim-controls">
        <label>Object Distance from Saturn: <strong id="tug-dist">3.0</strong> radii</label>
        <input type="range" id="tug-slider" min="1.0" max="4.0" step="0.1" value="3.0" />
        <div class="tug-war">
          <div class="tug-side">
            <div class="tug-label">Self-Gravity</div>
            <div class="tug-bar"><div class="tug-fill tug-green" id="tug-self" style="width:70%"></div></div>
            <div class="tug-desc">Pulls particles together → forms moons</div>
          </div>
          <div class="tug-side">
            <div class="tug-label">Tidal Force</div>
            <div class="tug-bar"><div class="tug-fill tug-red" id="tug-tidal" style="width:30%"></div></div>
            <div class="tug-desc">Pulls particles apart → forms rings</div>
          </div>
        </div>
        <div class="tug-winner" id="tug-winner">Winner: Self-Gravity → Moons can form! 🌕</div>
      </div>
    </div>
  `;

  const slider = el.querySelector('#tug-slider');
  const dist = el.querySelector('#tug-dist');
  const selfBar = el.querySelector('#tug-self');
  const tidalBar = el.querySelector('#tug-tidal');
  const winner = el.querySelector('#tug-winner');

  slider.addEventListener('input', () => {
    const d = parseFloat(slider.value);
    dist.textContent = d.toFixed(1);
    const tidalPct = Math.min((2.44 / d) * (2.44 / d) * 50, 95);
    const selfPct = 100 - tidalPct;
    selfBar.style.width = selfPct + '%';
    tidalBar.style.width = tidalPct + '%';
    if (d > 2.44) {
      winner.textContent = 'Winner: Self-Gravity → Moons can form! 🌕';
      winner.style.color = '#66bb6a';
    } else {
      winner.textContent = 'Winner: Tidal Force → Only rings here! 💫';
      winner.style.color = '#e8d282';
    }
  });
}

function uranusCollisionSim(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>☄️ Impact Simulator</h4>
      <p class="sim-desc">Aim a protoplanet at Uranus — see the resulting axial tilt!</p>
      <div class="sim-controls">
        <label>Impact Angle: <strong id="imp-angle">45</strong>°</label>
        <input type="range" id="imp-angle-slider" min="0" max="90" step="5" value="45" />
        <label>Impactor Mass: <strong id="imp-mass">1.0</strong> Earth masses</label>
        <input type="range" id="imp-mass-slider" min="0.1" max="3.0" step="0.1" value="1.0" />
        <div class="impact-result">
          <div class="impact-planet">🫧</div>
          <div class="impact-tilt">Resulting Tilt: <strong id="imp-tilt">72</strong>°</div>
          <div class="sim-result" id="imp-result">Close! Uranus's actual tilt is 98°</div>
        </div>
      </div>
      <p class="sim-insight" id="imp-insight">To get 98°, you need a massive impactor at a steep angle. The energy transfer is governed by conservation of angular momentum.</p>
    </div>
  `;

  const angleSlider = el.querySelector('#imp-angle-slider');
  const massSlider = el.querySelector('#imp-mass-slider');
  const angleVal = el.querySelector('#imp-angle');
  const massVal = el.querySelector('#imp-mass');
  const tilt = el.querySelector('#imp-tilt');
  const result = el.querySelector('#imp-result');
  const insight = el.querySelector('#imp-insight');

  function update() {
    const a = parseInt(angleSlider.value);
    const m = parseFloat(massSlider.value);
    angleVal.textContent = a;
    massVal.textContent = m.toFixed(1);
    const resultTilt = Math.min(Math.round(a * 0.8 * m + 10 * m), 170);
    tilt.textContent = resultTilt;

    const diff = Math.abs(resultTilt - 98);
    if (diff <= 5) { result.textContent = '🎯 Nearly perfect match with Uranus\'s 98° tilt!'; result.style.color = '#66bb6a'; }
    else if (diff <= 20) { result.textContent = 'Close! Adjust angle and mass to match 98°.'; result.style.color = '#ffa726'; }
    else { result.textContent = `Off by ${diff}° — keep experimenting!`; result.style.color = '#ef5350'; }

    insight.textContent = `A ${m.toFixed(1)} Earth-mass object hitting at ${a}° would transfer angular momentum proportional to mass × velocity × sin(angle). ${resultTilt > 90 ? 'Extreme tilts require both high mass and steep angles.' : 'Try increasing both to reach 98°.'}`;
  }

  angleSlider.addEventListener('input', update);
  massSlider.addEventListener('input', update);
  update();
}

function uranusAngularMomentum(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🔄 Angular Momentum Lab</h4>
      <p class="sim-desc">Angular momentum (L = I × ω) is CONSERVED. Once changed, it stays changed.</p>
      <div class="math-display">
        <div class="math-formula">L = I × ω</div>
        <p style="color:#8892b0;font-size:0.8rem;margin-top:0.5rem;">L = angular momentum, I = moment of inertia, ω = angular velocity</p>
      </div>
      <div class="am-facts">
        <div class="ring-fact">🔄 Uranus's original spin: ~normal (like other planets)</div>
        <div class="ring-fact">☄️ Giant impact transferred angular momentum</div>
        <div class="ring-fact">📐 New spin axis: tilted 98° from original</div>
        <div class="ring-fact">♾️ Conservation law: tilt is PERMANENT</div>
        <div class="ring-fact">🧲 Bonus: magnetic field tilted 59° from rotation axis — more impact evidence!</div>
      </div>
      <p class="sim-insight">This is the same principle as a figure skater spinning: angular momentum doesn't change unless an external force acts. The impact was that external force — and nothing since has been large enough to undo it.</p>
    </div>
  `;
}

function uranusTimeline(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>⏳ Early Solar System</h4>
      <p class="sim-desc">The first few hundred million years were chaotic.</p>
      <div class="timeline">
        <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><strong>~4.6 Bya</strong><br/>Solar system forms from gas cloud. Protoplanetary disk.</div></div>
        <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><strong>~4.5 Bya</strong><br/>Gas giants form rapidly. Dozens of protoplanets whizzing around.</div></div>
        <div class="timeline-item highlight"><div class="timeline-dot"></div><div class="timeline-content"><strong>~4.0-3.5 Bya</strong><br/>💥 GIANT IMPACT — Earth-sized body slams into Uranus, tilting it 98°.</div></div>
        <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><strong>~3.8 Bya</strong><br/>Late Heavy Bombardment. Solar system settles down.</div></div>
        <div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><strong>Today</strong><br/>Uranus still rolling on its side. Evidence frozen in time.</div></div>
      </div>
    </div>
  `;
}

function neptuneEnergyBudget(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>📊 Energy Budget Dashboard</h4>
      <p class="sim-desc">Neptune radiates 2.6x more energy than it receives from the Sun.</p>
      <div class="energy-bars">
        <div class="energy-row"><span>☀️ Solar Input</span><div class="soil-bar"><div class="soil-fill" style="width:38%;background:#ffa726"></div></div><span>1.0x</span></div>
        <div class="energy-row"><span>🔥 Internal Heat</span><div class="soil-bar"><div class="soil-fill" style="width:62%;background:#ef5350"></div></div><span>1.6x</span></div>
        <div class="energy-row"><span>📡 Total Radiated</span><div class="soil-bar"><div class="soil-fill" style="width:100%;background:#64b5f6"></div></div><span>2.6x</span></div>
      </div>
      <p class="sim-insight">Where does the extra 1.6x come from? Gravitational contraction (Kelvin-Helmholtz mechanism): Neptune is very slowly shrinking, converting gravitational potential energy into heat. Some may also come from "diamond rain" — methane compressed into diamond deep inside!</p>
    </div>
  `;
}

function neptuneWindFriction(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>💨 Wind & Friction Simulator</h4>
      <p class="sim-desc">See how surface friction affects maximum wind speed.</p>
      <div class="sim-controls">
        <label>Surface Friction: <strong id="wind-fric-val">None</strong></label>
        <input type="range" id="wind-fric" min="0" max="100" step="5" value="0" />
        <div class="sim-row">
          <span>Max Wind Speed: <strong id="wind-speed">2,100 km/h</strong></span>
        </div>
      </div>
      <p class="sim-insight" id="wind-insight">Neptune has zero solid surface. Once winds start, almost nothing slows them down — like an air hockey puck on a frictionless table.</p>
    </div>
  `;

  const slider = el.querySelector('#wind-fric');
  const fricVal = el.querySelector('#wind-fric-val');
  const speed = el.querySelector('#wind-speed');
  const insight = el.querySelector('#wind-insight');

  slider.addEventListener('input', () => {
    const f = parseInt(slider.value);
    const s = Math.round(2100 * (1 - f/115));
    fricVal.textContent = f === 0 ? 'None (gas giant)' : f < 30 ? 'Low (ocean world)' : f < 60 ? 'Medium (Earth-like)' : 'High (rocky terrain)';
    speed.textContent = Math.max(s, 50).toLocaleString() + ' km/h';
    speed.style.color = s > 1500 ? '#ef5350' : s > 500 ? '#ffa726' : '#66bb6a';
    if (f === 0) insight.textContent = 'No surface = no friction. Winds reach 2,100 km/h — fastest in the solar system!';
    else if (f < 30) insight.textContent = `Some friction slows winds to ~${Math.max(s,50)} km/h. Still extreme by Earth standards.`;
    else if (f < 60) insight.textContent = `Earth-like friction. Winds max at ~${Math.max(s,50)} km/h — like a strong hurricane.`;
    else insight.textContent = `Heavy surface friction. Mountains and terrain absorb wind energy. Max ~${Math.max(s,50)} km/h.`;
  });
}

function neptuneConvection(el) {
  el.innerHTML = `
    <div class="sim-widget">
      <h4>🔃 Convection Cell Viewer</h4>
      <p class="sim-desc">Internal heat rises, creating powerful convection currents that drive surface winds.</p>
      <div class="convection-diagram">
        <div class="conv-layer conv-core">🔥 Hot Core (radiates 2.6x solar input)</div>
        <div class="conv-arrow">⬆️ Hot gas rises</div>
        <div class="conv-layer conv-mid">🌀 Convection Zone (energy transfer)</div>
        <div class="conv-arrow">⬆️ Drives circulation</div>
        <div class="conv-layer conv-top">💨 Surface Winds (2,100 km/h)</div>
        <div class="conv-arrow conv-down">⬇️ Cool gas sinks back down</div>
      </div>
      <p class="sim-insight">It's like a pot of boiling water: heat at the bottom drives circulation at the top. Neptune's "burner" is its own core, and with no friction to stop it, the resulting winds are the fastest anywhere in the solar system.</p>
    </div>
  `;
}

// ============================================================
// RENDERER MAP — maps tool IDs to render functions
// ============================================================

const renderers = {
  // Mercury
  'gravity-slider':    mercuryGravitySlider,
  'escape-velocity':   mercuryEscapeVelocity,
  'solar-wind':        mercurySolarWind,
  // Venus
  'atmosphere-layers': venusAtmosphereLayers,
  'greenhouse-sim':    venusGreenhouseSim,
  'planet-compare':    venusPlanetCompare,
  // Earth
  'moon-distance':     earthMoonDistance,
  'tidal-math':        earthTidalMath,
  'flood-visualizer':  earthFloodVisualizer,
  // Mars
  'soil-analyzer':     marsSoilAnalyzer,
  'plant-survival':    marsPlantSurvival,
  'radiation-shield':  marsRadiationShield,
  // Jupiter
  'storm-simulator':   jupiterStormSimulator,
  'heat-engine':       jupiterHeatEngine,
  'coriolis-spinner':  jupiterCoriolisSpin,
  // Saturn
  'roche-limit':       saturnRocheLimit,
  'ring-composition':  saturnRingComposition,
  'tidal-forces':      saturnTidalForces,
  // Uranus
  'collision-sim':     uranusCollisionSim,
  'angular-momentum':  uranusAngularMomentum,
  'solar-system-timeline': uranusTimeline,
  // Neptune
  'energy-budget':     neptuneEnergyBudget,
  'wind-friction':     neptuneWindFriction,
  'convection-viewer': neptuneConvection,
};