// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// In-memory log store (capped)
const MAX_LOGS = 2000;
const logs = [];

// Utility to create log object
function createLog({ service = 'unknown', level = 'info', message = '', meta = {} } = {}) {
  const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return {
    id,
    timestamp: new Date().toISOString(),
    service,
    level,
    message,
    meta
  };
}

// REST API: get recent logs (optional ?limit=)
app.get('/logs', (req, res) => {
  const limit = Math.max(1, Math.min(1000, parseInt(req.query.limit || '200', 10)));
  const slice = logs.slice(-limit);
  res.json(slice);
});

// REST API: push a log (eg. from microservice)
app.post('/logs', (req, res) => {
  const { service, level, message, meta } = req.body || {};
  if (!message) return res.status(400).json({ error: 'message is required' });

  const log = createLog({ service, level: (level || 'info'), message, meta });
  pushLog(log);
  res.status(201).json(log);
});

// Health
app.get('/health', (req, res) => res.json({ status: 'OK' }));

// push log into store and broadcast via Socket.IO
function pushLog(log) {
  logs.push(log);
  if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
  io.emit('log', log);
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  // allow client to request latest N logs on connect
  socket.on('getLatest', (n = 200) => {
    const slice = logs.slice(-Math.max(1, Math.min(1000, n)));
    socket.emit('latest', slice);
  });

  socket.on('disconnect', () => {
    // console.log('Client disconnected', socket.id);
  });
});

// Simulated log producers (multiple microservices) — adjustable
const services = [
  { name: 'auth-service', freq: 800 },
  { name: 'payments', freq: 1200 },
  { name: 'orders', freq: 900 },
  { name: 'search', freq: 1400 },
  { name: 'web', freq: 600 },
];

const levels = ['debug', 'info', 'warn', 'error'];

function startSimulators(enabled = true) {
  if (!enabled) return;
  services.forEach(svc => {
    setInterval(() => {
      const levelRoll = Math.random();
      let level = 'info';
      if (levelRoll > 0.94) level = 'error';
      else if (levelRoll > 0.8) level = 'warn';
      else if (levelRoll < 0.1) level = 'debug';

      const messages = [
        'Request completed',
        'User authenticated',
        'Payment processed',
        'Cache miss — fetching',
        'Indexed 123 documents',
        'DB connection pool acquired',
        'Timeout contacting upstream',
        'Unhandled exception',
        'Job started',
        'Job completed'
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      const log = createLog({
        service: svc.name,
        level,
        message: `${msg} — ${Math.random().toString(36).slice(2, 8)}`,
        meta: { load: Math.round(Math.random() * 100) }
      });
      pushLog(log);
    }, Math.max(150, svc.freq * (0.6 + Math.random() * 0.8)));
  });
}

// start simulators
startSimulators(true);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Log monitor server listening on http://0.0.0.0:${PORT}`);
});
