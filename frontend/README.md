# AI-Powered X-Ray Threat Detection — Frontend

A production-grade security dashboard for real-time X-ray threat analysis.

## Tech Stack
- **React 18** + **Vite**
- **Tailwind CSS** (custom cyber/security theme)
- **Axios** for API integration
- **Orbitron + Exo 2** fonts (security aesthetic)

## Setup

```bash
npm install
npm run dev
```

App runs at: http://localhost:5173

## Backend API Required

Ensure the backend is running at `http://localhost:8000`

### POST /predict
**Request:** `FormData` with `file` (image)

**Response:**
```json
{
  "status": "SAFE" | "THREAT",
  "detections": [
    { "class": "gun", "confidence": 0.92 }
  ],
  "output_image_path": "/outputs/result.jpg"
}
```

## Project Structure

```
src/
├── App.jsx              # Root layout, API logic, state
├── main.jsx             # Entry point
├── index.css            # Global styles + Tailwind
└── components/
  ├── UploadBox.jsx    # Drag & drop image upload
  ├── ResultBox.jsx    # Detection output + badges
  └── StatusBar.jsx    # SAFE/THREAT status display
```

## Features
- Drag & drop or click-to-upload
- Live processing spinner with scan animation
- Detection confidence badges with color-coded threat levels
- Animated SAFE (green glow) / THREAT (red pulse) status
- Glassmorphism UI with cyber-grid background
- Fully responsive (mobile + desktop)
- Error handling for invalid files and API failures
