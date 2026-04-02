//kaplay config
kaplay({
  background: [5, 5, 16],
  letterbox: false,
  crisp: false,
})

const SCALE = 0.9

// stars
const STARS = Array.from({ length: 280 }, () => ({
  x: Math.random() * 4000,
  y: Math.random() * 1000,
  r: Math.random() * 1.5 + 0.4,
  bright: Math.random() * 0.4 + 0.4,
  twinkle: Math.random() * 0.3 + 0.05,
}))

// game state
const STATE = {
  oxygen: 100,
  score: 0,
  currentPlanet: 0,
  currentQuestion: 0,
  alive: true,
}

// Ship movement and starting positon
let shipX = 40
let shipY = 0
let shipTargetX = 40
let shipTargetY = 0
let shipTraveling = false
let onArrivalCb = null
let engineFlicker = 0
let camLeft = 0        // world X of screen's left edge
let planetYOffsets = []
let activeSensorInterval = null

function pX(i) { return 40 + PLANETS[i].dist * SCALE }
function pY(i) { return height() * 0.52 + planetYOffsets[i] }

//ui overlays
function showOverlay(id) {
  document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'))
  document.getElementById(id).classList.add('active')
}
function hideOverlays() {
  document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'))
}
function updateHUD() {
  const p = PLANETS[STATE.currentPlanet]
  document.getElementById('hudPlanet').textContent = p ? p.name : ''
  document.getElementById('o2Text').textContent = Math.round(STATE.oxygen) + '%'
  document.getElementById('hudScore').textContent = STATE.score
  const bar = document.getElementById('o2Bar')
  bar.style.width = STATE.oxygen + '%'
  bar.style.background = STATE.oxygen > 50 ? '#5eff8a' : STATE.oxygen > 25 ? '#ffc040' : '#ff4444'
}

// questions logic
function showQuestion() {
  if (activeSensorInterval) { clearInterval(activeSensorInterval); activeSensorInterval = null }

  const planet = PLANETS[STATE.currentPlanet]
  const meta = PLANET_META[STATE.currentPlanet]
  const qData = QUESTIONS[STATE.currentPlanet][STATE.currentQuestion]
  const qNum = STATE.currentQuestion + 1
  const panel = document.getElementById('questionPanel')

  sendToPhone({
    type: 'question', planet: planet.name, qNum, total: 3,
    topic: meta.topic, isSensor: qData.type === 'sensor', sensorType: qData.sensor || null,
  })

  let html = `<h2>${planet.name} — Q${qNum}/3</h2>`
  html += `<div class="subtitle">${meta.topic} · ${meta.difficulty}</div>`

  const useSensor = qData.type === 'sensor' && phoneConnected

  if (qData.type === 'mc' || !useSensor) {
    const q = qData.type === 'sensor'
      ? { q: qData.fallbackQ, choices: qData.fallbackChoices, answer: qData.fallbackAnswer, explain: qData.explain }
      : qData
    html += `<div class="question-text">${q.q}</div>`
    html += `<div class="choices-grid">`
    q.choices.forEach((c, i) => {
      html += `<button class="answer-btn" data-idx="${i}">${String.fromCharCode(65 + i)}) ${c}</button>`
    })
    html += `</div>`
    if (qData.type === 'sensor' && !phoneConnected) {
      html += `<div class="phone-indicator">☏ No phone — using text fallback</div>`
    }
    panel.innerHTML = html
    showOverlay('questionOverlay')
    attachMC(q.answer, meta)
  } else {
    // sensors
    html += `<div class="question-text">${qData.q}</div>`
    html += `<div class="sensor-zone">`
    html += `  <div class="sensor-label">☏ PHONE ${qData.sensor.toUpperCase()} READING</div>`
    html += `  <div class="sensor-value" id="sensorVal">Waiting for phone...</div>`
    html += `  <div class="sensor-instruction">Move your phone as instructed above.</div>`
    html += `  <div class="progress-outer"><div class="progress-inner" id="sensorProg"></div></div>`
    html += `  <div class="phone-indicator connected">☏ Phone streaming sensor data</div>`
    html += `</div>`
    panel.innerHTML = html
    showOverlay('questionOverlay')
    sendToPhone({ type: 'sensor_start', sensor: qData.sensor, instruction: qData.q })
    startSensorCheck(qData, meta)
  }
}

function attachMC(correctIdx, meta) {
  const btns = document.querySelectorAll('.answer-btn')
  btns.forEach(btn => {
    btn.addEventListener('click', function handler() {
      btns.forEach(b => { b.disabled = true; b.removeEventListener('click', handler) })
      const idx = parseInt(this.dataset.idx)
      if (idx === correctIdx) {
        this.classList.add('correct')
        handleCorrect(meta)
      } else {
        this.classList.add('wrong')
        btns[correctIdx].classList.add('correct')
        handleWrong(meta)
      }
    })
  })
}

function startSensorCheck(qData, meta) {
  let holdStart = null
  const th = qData.threshold
  activeSensorInterval = setInterval(() => {
    const sd    = sensorData
    const valEl = document.getElementById('sensorVal')
    const prog  = document.getElementById('sensorProg')
    if (!valEl) { clearInterval(activeSensorInterval); return }

    let inRange = false, display = ''
    if (th.axis === 'z') {
      display = sd.accel.z.toFixed(2) + ' m/s²'
      inRange = sd.accel.z >= th.min && sd.accel.z <= th.max
    } else if (th.axis === 'beta') {
      display = sd.beta.toFixed(1) + '°'
      inRange = sd.beta >= th.min && sd.beta <= th.max
    } else if (th.axis === 'gamma') {
      const g = Math.abs(sd.gamma)
      display = g.toFixed(1) + '°'
      inRange = g >= th.min && g <= th.max
    } else if (th.heading !== undefined) {
      display = sd.alpha.toFixed(1) + '°'
      const diff = Math.abs(((sd.alpha - th.heading + 540) % 360) - 180)
      inRange = diff <= th.tolerance
    }
    valEl.textContent = display

    if (inRange) {
      if (!holdStart) holdStart = Date.now()
      const pct = Math.min(100, ((Date.now() - holdStart) / (th.duration || 2000)) * 100)
      if (prog) prog.style.width = pct + '%'
      if (Date.now() - holdStart >= (th.duration || 2000)) {
        clearInterval(activeSensorInterval); activeSensorInterval = null
        if (prog) prog.style.width = '100%'
        sendToPhone({ type: 'sensor_result', success: true })
        handleCorrect(meta)
      }
    } else {
      holdStart = null
      if (prog) prog.style.width = '0%'
    }
  }, 80)
}

function handleCorrect(meta) {
  STATE.score  += meta.pluto ? 50 : (10 + STATE.currentPlanet * 5)
  STATE.oxygen  = Math.min(100, STATE.oxygen + (meta.pluto ? 5 : 8))
  updateHUD()
  const qData = QUESTIONS[STATE.currentPlanet][STATE.currentQuestion]
  const panel = document.getElementById('questionPanel')
  panel.innerHTML += `<div class="result-msg correct">✓ Correct! +O₂ restored.<br><br>${qData.explain}</div>`
  const label = STATE.currentQuestion < 2
    ? 'Next Question'
    : (STATE.currentPlanet < 8 ? 'Travel to ' + PLANETS[STATE.currentPlanet + 1].name : 'See Results')
  panel.innerHTML += `<button class="btn-primary" id="nextBtn">${label}</button>`
  document.getElementById('nextBtn').onclick = advance
  sendToPhone({ type: 'result', correct: true, o2: Math.round(STATE.oxygen), score: STATE.score })
}

function handleWrong(meta) {
  if (meta.pluto) {
    STATE.oxygen = 0; STATE.alive = false; updateHUD()
    sendToPhone({ type: 'death', cause: 'frozen' })
    showDeath('frozen')
    return
  }
  STATE.oxygen = Math.max(0, STATE.oxygen - meta.o2Penalty)
  updateHUD()
  if (STATE.oxygen <= 0) {
    STATE.alive = false
    sendToPhone({ type: 'death', cause: 'suffocated' })
    showDeath('suffocated')
    return
  }
  const qData = QUESTIONS[STATE.currentPlanet][STATE.currentQuestion]
  const panel = document.getElementById('questionPanel')
  panel.innerHTML += `<div class="result-msg wrong">✘ Wrong! O₂ −${meta.o2Penalty}%.<br><br>${qData.explain}</div>`
  const label = STATE.currentQuestion < 2
    ? 'Next Question'
    : (STATE.currentPlanet < 8 ? 'Travel to ' + PLANETS[STATE.currentPlanet + 1].name : 'See Results')
  panel.innerHTML += `<button class="btn-primary" id="nextBtn">${label}</button>`
  document.getElementById('nextBtn').onclick = advance
  sendToPhone({ type: 'result', correct: false, o2: Math.round(STATE.oxygen), score: STATE.score })
}

function advance() {
  STATE.currentQuestion++
  if (STATE.currentQuestion >= 3) {
    STATE.currentQuestion = 0
    STATE.currentPlanet++
    if (STATE.currentPlanet >= PLANETS.length) { showWin(); return }
    hideOverlays()
    travelTo(STATE.currentPlanet)
  } else {
    showQuestion()
  }
}

function travelTo(idx) {
  const p = PLANETS[idx]
  shipTargetX = pX(idx)
  shipTargetY = pY(idx)
  shipTraveling = true
  updateHUD()
  document.getElementById('planetLabel').textContent = 'Traveling to ' + p.name + '...'
  sendToPhone({ type: 'travel', planet: p.name })
  onArrivalCb = () => {
    document.getElementById('planetLabel').textContent = p.name
    showQuestion()
  }
}

function showDeath(cause) {
  const p     = PLANETS[STATE.currentPlanet]
  const panel = document.getElementById('deathPanel')
  if (cause === 'frozen') {
    panel.innerHTML = `<h2>❆ FROZEN SOLID</h2>
      <p>Pluto's −230°C cold claims another explorer.</p>
      <p style="color:#6a8ccc;margin-top:16px">Score: ${STATE.score} · Reached: ${p.name}</p>
      <button class="btn-primary" onclick="location.reload()">Try Again</button>`
  } else {
    panel.innerHTML = `<h2>☠︎︎ OXYGEN DEPLETED</h2>
      <p>Life support failed near ${p.name}.</p>
      <p style="color:#6a8ccc;margin-top:16px">Score: ${STATE.score} · Final O₂: 0%</p>
      <button class="btn-primary" onclick="location.reload()">Try Again</button>`
  }
  showOverlay('deathOverlay')
}

function showWin() {
  const grade = STATE.oxygen > 75 ? 'S' : STATE.oxygen > 50 ? 'A' : STATE.oxygen > 25 ? 'B' : 'C'
  const panel = document.getElementById('winPanel')
  panel.innerHTML = `<h1>♛ Mission Complete!</h1>
    <p style="color:#b0c4e8;font-size:1.1em">You traversed the entire Solar System!</p>
    <p style="color:#8bb4ff;font-size:1.3em;margin:16px 0">Score: ${STATE.score} · Grade: ${grade}</p>
    <p style="color:#6a8ccc">Final O₂: ${Math.round(STATE.oxygen)}%</p>
    <button class="btn-primary" onclick="location.reload()" style="margin-top:18px">Play Again</button>`
  showOverlay('winOverlay')
  sendToPhone({ type: 'win', score: STATE.score, grade })
}

// start buttons
document.getElementById('startBtn').onclick = () => {
  hideOverlays()
  document.getElementById('hud').style.display = 'flex'
  updateHUD()
  sendToPhone({ type: 'game_start' })
  travelTo(0)
}
document.getElementById('skipBtn').onclick = () => {
  hideOverlays()
  document.getElementById('hud').style.display = 'flex'
  updateHUD()
  travelTo(0)
}

// room code
document.getElementById('roomCode').textContent = ROOM_CODE

// KAPLAY scene

scene("space", () => {
  // Compute planet Y offsets now that height() is available
  planetYOffsets = PLANETS.map(() => (Math.random() - 0.5) * 40)

  // Place ship at the Sun to start; it will travel to Mercury when the game begins
  shipY = height() * 0.52
  shipTargetY = shipY
  camLeft = shipX - width() * 0.3

  onUpdate(() => {
    engineFlicker += dt() * 3

    // Move ship toward target
    if (shipTraveling) {
      const dx = shipTargetX - shipX
      const dy = shipTargetY - shipY
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < 2) {
        shipX = shipTargetX
        shipY = shipTargetY
        shipTraveling = false
        if (onArrivalCb) { setTimeout(onArrivalCb, 500); onArrivalCb = null }
      } else {
        const spd = Math.max(80, d * 1.2) * dt()
        shipX += (dx / d) * spd
        shipY += (dy / d) * spd
      }
    }

    // Smooth camera pan
    const targetCamLeft = shipX - width() * 0.3
    camLeft += (targetCamLeft - camLeft) * 0.04
    camPos(camLeft + width() / 2, height() / 2)
  })

  onDraw(() => {
    const t = time()
    const screenW = width()
    const screenH = height()
    const sunY = screenH * 0.52

    // stars
    STARS.forEach(s => {
      let sx = s.x - camLeft * 0.15
      sx = ((sx % (screenW + 200)) + (screenW + 200)) % (screenW + 200) - 100
      const sy = s.y % screenH
      const alpha = Math.max(0.1, s.bright + Math.sin(t * s.twinkle * 6 + s.x) * 0.15)
      drawCircle({
        pos: vec2(camLeft + sx, sy),
        radius: s.r,
        color:rgb(200, 220, 255),
        opacity: alpha,
      })
    })

    // Sun Draw Options
    // Outer glow
    drawCircle({ pos: vec2(40, sunY), radius: 120, color: rgb(255, 140, 20), opacity: 0.10 })
    drawCircle({ pos: vec2(40, sunY), radius: 95, color: rgb(255, 170, 30), opacity: 0.18 })
    // Core
    drawCircle({ pos: vec2(40, sunY), radius: 70, color: rgb(255, 200, 50) })
    // Highlight
    drawCircle({ pos: vec2(22, sunY - 28), radius: 30, color: rgb(255, 245, 180), opacity: 0.30 })

    // orbit paths and planets
    PLANETS.forEach((p, i) => { // +15 +25
      const px = pX(i)
      const py = pY(i)
      const orbitStartX = i === 0 ? 40 : pX(i - 1)

      // Orbit dashes
      for (let dx = orbitStartX; dx < px; dx += 10) {
        drawRect({
          pos: vec2(dx, sunY - 0.5),
          width: 3,
          height: 1.5,
          color:rgb(50, 60, 90),
          opacity: 0.30,
        })
      }

      // Saturn ring
      if (p.ring) {
        drawLine({ p1: vec2(px - p.r * 2.3, py + 3), p2: vec2(px + p.r * 2.3, py + 3), width: 7, color: rgb(190, 180, 130), opacity: 0.28 })
        drawLine({ p1: vec2(px - p.r * 2.1, py),     p2: vec2(px + p.r * 2.1, py),     width: 5, color: rgb(210, 200, 150), opacity: 0.40 })
      }

      // Planet glow
      drawCircle({ pos: vec2(px, py), radius: p.r * 2.2, color: rgb(...p.color), opacity: 0.10 })
      // Planet body
      drawCircle({ pos: vec2(px, py), radius: p.r, color: rgb(...p.color) })
      // Highlight
      drawCircle({ pos: vec2(px - p.r * 0.28, py - p.r * 0.28), radius: p.r * 0.45, color: rgb(255, 255, 255), opacity: 0.22 })

      // Planet name label
      drawText({
        text: p.name,
        pos: vec2(px - p.name.length * 3, py + p.r + 16),
        size: 11,
        color:rgb(120, 150, 190),
      })
    })

    // Ship
    const eg = 0.4 + Math.sin(engineFlicker * 5) * 0.25
    // Engine glow (behind ship)
    drawCircle({ pos: vec2(shipX - 16, shipY), radius: 6,  color: rgb(64, 128, 255), opacity: eg })
    drawCircle({ pos: vec2(shipX - 20, shipY), radius: 10, color: rgb(64, 128, 255), opacity: eg * 0.4 })
    // Ship body triangle (nose points right)
    drawLine({ p1: vec2(shipX + 16, shipY),      p2: vec2(shipX - 10, shipY - 10), width: 2, color: rgb(200, 220, 255) })
    drawLine({ p1: vec2(shipX + 16, shipY),      p2: vec2(shipX - 10, shipY + 10), width: 2, color: rgb(200, 220, 255) })
    drawLine({ p1: vec2(shipX - 10, shipY - 10), p2: vec2(shipX - 10, shipY + 10), width: 2, color: rgb(200, 220, 255) })
    // Inner cockpit accent
    drawLine({ p1: vec2(shipX + 8, shipY), p2: vec2(shipX - 4, shipY - 5), width: 1, color: rgb(138, 180, 255) })
    drawLine({ p1: vec2(shipX + 8, shipY), p2: vec2(shipX - 4, shipY + 5), width: 1, color: rgb(138, 180, 255) })
  })
})

go("space")

// Init PeerJS connection (defined in peer.js)
initPeer()
