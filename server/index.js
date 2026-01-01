import express from 'express';
import cors from 'cors';
import Cube from 'cubejs';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

Cube.initSolver();

const COLOR_TO_FACE = {
  W: 'U',
  R: 'R',
  G: 'F',
  Y: 'D',
  O: 'L',
  B: 'B'
};

app.post('/solve', (req, res) => {
  const { cube } = req.body;

  if (!Array.isArray(cube) || cube.length !== 54) {
    return res.status(400).json({ error: 'Invalid cube data' });
  }

  try {
    const faceletString = cube
      .map(c => COLOR_TO_FACE[c])
      .join('');

    const myCube = Cube.fromString(faceletString);
    const solution = myCube.solve();

    res.json({ status: 'ok', solution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Solver error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
