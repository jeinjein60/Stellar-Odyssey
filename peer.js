function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

const ROOM_CODE = generateCode()
let peer, conn
let phoneConnected = false
const sensorData = { alpha: 0, beta: 0, gamma: 0, accel: { x: 0, y: 0, z: 0 } }

function initPeer() {
  const peerId = 'stellar-odyssey-' + ROOM_CODE.toLowerCase()
  peer = new Peer(peerId, { debug: 0 })

  peer.on('open', () => {
    document.getElementById('connStatus').textContent = 'Code ready — enter ' + ROOM_CODE + ' on your phone'
  })

  peer.on('connection', (c) => {
    conn = c
    conn.on('open', () => {
      phoneConnected = true
      document.getElementById('connStatus').textContent = '☏ Phone connected!'
      document.getElementById('connStatus').classList.add('connected')
      document.getElementById('startBtn').style.opacity = '1'
      document.getElementById('startBtn').style.pointerEvents = 'auto'
      document.getElementById('startBtn').textContent = 'Launch Mission'
      document.getElementById('hudPhone').textContent = '☏ Connected'
      document.getElementById('hudPhone').style.opacity = '1'
      document.getElementById('hudPhone').style.color = '#5eff8a'
      sendToPhone({ type: 'status', text: 'Connected! Waiting for launch...' })
    })

    conn.on('data', (data) => {
      if (data.type === 'sensor') {
        sensorData.alpha = data.alpha || 0
        sensorData.beta  = data.beta  || 0
        sensorData.gamma = data.gamma || 0
        sensorData.accel = data.accel || { x: 0, y: 0, z: 0 }
      }
    })

    conn.on('close', () => {
      phoneConnected = false
      document.getElementById('hudPhone').textContent = '☏ Disconnected'
      document.getElementById('hudPhone').style.color = '#ff6040'
    })
  })

  peer.on('error', (err) => {
    console.warn('Peer error:', err)
    if (err.type === 'unavailable-id') {
      document.getElementById('connStatus').textContent = 'Code conflict — refreshing...'
      setTimeout(() => location.reload(), 1500)
    }
  })
}

function sendToPhone(msg) {
  if (conn && conn.open) conn.send(msg)
}
