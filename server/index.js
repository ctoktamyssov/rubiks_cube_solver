// --- Core server imports ---
import express from 'express';
import cors from 'cors';

// --- Rubik's Cube solver ---
import Cube from 'cubejs';

// --- Serial communication with ESP32 ---
import { SerialPort } from 'serialport';

// ----------------------------
// Server setup
// ----------------------------
const app = express();
const PORT = 3000;

// Allow frontend (React) to talk to backend
app.use(cors());
app.use(express.json());

// Initialize CubeJS solver (loads pruning tables into memory)
Cube.initSolver();

// ----------------------------
// Serial port setup (ESP32)
// ----------------------------
// ⚠️ CHANGE THIS TO YOUR ACTUAL PORT (e.g. COM3, COM4, /dev/ttyUSB0)
const esp32Port = new SerialPort({
  path: 'COM5',
  baudRate: 115200,
});

// Log when serial connection opens
esp32Port.on('open', () => {
  console.log('ESP32 serial connection opened');
});

// Optional: log serial errors
esp32Port.on('error', err => {
  console.error('Serial error:', err.message);
});

// Helper function to send data to ESP32
function sendToESP32(message) {
  // Send message followed by newline so ESP32 knows when it ends
  esp32Port.write(message + '\n');
}

// ----------------------------
// Color → Face mapping
// ----------------------------
// Frontend uses colors (W, R, G, Y, O, B)
// CubeJS expects faces (U, R, F, D, L, B)
const COLOR_TO_FACE = {
  W: 'U', // White = Up
  R: 'R', // Red = Right
  G: 'F', // Green = Front
  Y: 'D', // Yellow = Down
  O: 'L', // Orange = Left
  B: 'B', // Blue = Back
};

// ----------------------------
// Solve endpoint
// ----------------------------
app.post('/solve', (req, res) => {
  const { cube } = req.body;

  // Basic validation
  if (!Array.isArray(cube) || cube.length !== 54) {
    return res.status(400).json({ error: 'Invalid cube data' });
  }

  try {
    // Convert color array into CubeJS facelet string
    // Example result:
    // "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"
    const faceletString = cube
      .map(color => COLOR_TO_FACE[color])
      .join('');

    // Build cube from facelet string
    const myCube = Cube.fromString(faceletString);

    // Solve cube (returns move string like: "R U R' F2 D")
    const solution = myCube.solve();

    // Send solution to ESP32 over USB serial
    sendToESP32(solution);

    // Respond back to frontend
    res.json({
      status: 'ok',
      solution,
    });

  } catch (err) {
    console.error('Solver error:', err);
    res.status(500).json({ error: 'Solver error' });
  }
});

// ----------------------------
// Start server
// ----------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});