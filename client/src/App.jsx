import { useState } from 'react';

// Colors mapping
const COLORS = ['W', 'R', 'G', 'Y', 'O', 'B'];
const colorMap = {
  W: 'white',
  R: 'red',
  G: 'green',
  B: 'blue',
  Y: 'yellow',
  O: 'orange',
  null: '#ccc'
};

// Single sticker
function Sticker({ color, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        backgroundColor: colorMap[color],
        border: '1px solid black',
        cursor: 'pointer'
      }}
    />
  );
}

// One face (3x3)
function Face({ startIndex, cube, handleClick }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 40px)' }}>
      {Array.from({ length: 9 }, (_, i) => (
        <Sticker
          key={i}
          color={cube[startIndex + i]}
          onClick={() => handleClick(startIndex + i)}
        />
      ))}
    </div>
  );
}

// Main App
export default function App() {
  const [cube, setCube] = useState(Array(54).fill(null));

  // Cycle color on click
  function handleStickerClick(index) {
    setCube(prev => {
      const next = [...prev];
      const current = prev[index];
      const nextColor = COLORS[(COLORS.indexOf(current) + 1) % COLORS.length];
      next[index] = nextColor;
      return next;
    });
  }

  // Submit cube to backend
  async function handleSubmit() {
    if (cube.includes(null)) {
      alert('Please fill all 54 squares!');
      return;
    }

    const res = await fetch('http://localhost:3000/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cube })
    });

    const data = await res.json();
    console.log('Solver response:', data);
    alert('Check console for solver response!');
  }

  // Optional: test backend button
  async function testBackend() {
    const res = await fetch('http://localhost:3000/solve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cube: Array(54).fill('W') })
    });

    const data = await res.json();
    console.log('Test backend response:', data);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Rubik's Cube Input</h1>
      <p>Click each square to select a color (W, R, G, Y, O, B)</p>

      {/* Top face */}
      <div style={{ marginBottom: 10 }}>
        <Face startIndex={0} cube={cube} handleClick={handleStickerClick} />
      </div>

      {/* Middle faces: L F R B */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <Face startIndex={36} cube={cube} handleClick={handleStickerClick} />
        <Face startIndex={18} cube={cube} handleClick={handleStickerClick} />
        <Face startIndex={9} cube={cube} handleClick={handleStickerClick} />
        <Face startIndex={45} cube={cube} handleClick={handleStickerClick} />
      </div>

      {/* Bottom face */}
      <div>
        <Face startIndex={27} cube={cube} handleClick={handleStickerClick} />
      </div>

      <button onClick={handleSubmit} style={{ marginTop: 20, padding: '10px 20px' }}>
        Submit Cube
      </button>

      <button onClick={testBackend} style={{ marginTop: 10, padding: '10px 20px' }}>
        Test Backend
      </button>
    </div>
  );
}
