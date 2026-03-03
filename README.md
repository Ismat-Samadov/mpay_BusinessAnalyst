# ⚓ Battleship

A fully-featured, responsive Battleship game built with **Next.js 15**, **TypeScript**, and **Tailwind CSS v4**.

---

## 🎮 How to Play

### Setup Phase
1. **Select a ship** from the fleet panel on the left
2. **Click a square** on your board (left grid) to place it
3. Press **`R`** or click **Rotate** to toggle horizontal/vertical orientation
4. Use **Auto-Place** to randomly place all ships instantly
5. Use **Reset** to clear ships and start over

### Battle Phase
- **Click any square** on the enemy grid (right board) to fire
- **Hit** → you get another shot (keep firing!)
- **Miss** → the AI takes its turn
- **Sunk** → enemy ship is destroyed permanently
- First side to sink all 5 enemy ships **wins**

---

## 🚢 Fleet

| Ship        | Size | Symbol |
|-------------|------|--------|
| Carrier     | 5    | 🚢     |
| Battleship  | 4    | ⚓     |
| Cruiser     | 3    | 🛥️    |
| Submarine   | 3    | 🤿     |
| Destroyer   | 2    | ⛵     |

---

## 🤖 AI Strategy

The AI uses a **Hunt → Target → Destroy** algorithm:

- **Hunt** — checkerboard firing pattern to maximally cover the board
- **Target** — after a hit, attacks adjacent cells to find the ship
- **Destroy** — once two hits align, continues along that axis to finish the ship

---

## ⌨️ Shortcuts

| Key | Action      |
|-----|-------------|
| `R` | Rotate ship |

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Tech Stack

- **Next.js 15** (App Router)
- **TypeScript 5**
- **Tailwind CSS v4**
- **next/font** — Orbitron (Google Fonts)

---

## 📁 Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout & Orbitron font
│   ├── page.tsx          # Game state & main UI
│   └── globals.css       # Ocean theme & CSS animations
├── components/
│   ├── Board.tsx         # 10×10 interactive grid
│   ├── ShipSelector.tsx  # Ship placement panel (setup)
│   ├── FleetStatus.tsx   # Ship health tracker
│   └── GameOverModal.tsx # Win/lose overlay
└── lib/
    ├── types.ts          # TypeScript types
    └── gameLogic.ts      # Pure game logic + AI
```
