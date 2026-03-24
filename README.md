# AI-Powered X-Ray Threat Detection System

End-to-end threat detection app using a YOLOv8 model for X-ray image analysis, with:
- FastAPI backend inference service
- React + Vite frontend dashboard
- Single-server deployment mode (FastAPI serves frontend + API)

## What This Project Does

Upload an X-ray image, run YOLOv8 inference, and return:
- A status: `SAFE` or `THREAT`
- Detected object classes with confidence scores
- An annotated output image with bounding boxes

Threat logic:
- If any detection has confidence > 0.4, status is `THREAT`
- Otherwise status is `SAFE`

## Tech Stack

### Backend
- FastAPI
- Uvicorn
- Ultralytics YOLOv8
- OpenCV
- Python multipart upload handling

### Frontend
- React 18
- Vite
- Axios
- Tailwind CSS

## Project Structure

```text
FIZZBUZZ/
├── Best.pt
├── README.md
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── model/
│   │   └── best.pt
│   └── outputs/
└── frontend/
    ├── package.json
    ├── index.html
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   └── components/
    │       ├── UploadBox.jsx
    │       ├── ResultBox.jsx
    │       └── StatusBar.jsx
    └── dist/ (generated after build)
```

## One-Time Setup

### 1) Python dependencies

From project root:

```bash
cd backend
python -m pip install -r requirements.txt
```

### 2) Frontend dependencies

From project root:

```bash
cd frontend
npm install
```

### 3) Build frontend for combined deployment

```bash
cd frontend
npm run build
```

This generates `frontend/dist`, which FastAPI serves at `/`.

### 4) Optional environment configuration

Backend:

```bash
cd backend
cp .env.example .env
```

Frontend (only needed for separate dev mode or API key usage):

```bash
cd frontend
cp .env.example .env
```

## Run (Combined Backend + Frontend on One Port)

From project root:

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

Open:
- App UI: http://127.0.0.1:8000/
- API docs: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

## API Reference

### GET /health

Response:

```json
{
  "status": "ok",
  "model_loaded": true
}
```

### POST /predict

Request:
- Content-Type: multipart/form-data
- Field name: `file`
- Value: image file
- Optional header when enabled: `x-api-key`

Response shape:

```json
{
  "status": "SAFE",
  "detections": [
    {
      "class": "knife",
      "confidence": 0.94
    }
  ],
  "output_image_path": "/outputs/prediction_xxx.jpg"
}
```

## Example Request (CLI)

```bash
curl -X POST "http://127.0.0.1:8000/predict" \
  -F "file=@/absolute/path/to/image.jpg"
```

## Notes on CORS and Serving

- CORS is enabled in FastAPI for frontend integration.
- In combined mode, frontend and API are served from the same origin (`:8000`).
- Annotated images are served from `/outputs/...`.

## Environment Variables

### Backend (`backend/.env`)

- `XRAY_API_KEY`: Optional API key required on `POST /predict` via `x-api-key` header.
- `CONFIDENCE_THRESHOLD`: Detection threshold used by YOLO (default `0.4`).
- `MAX_UPLOAD_SIZE_MB`: Upload cap per request (default `10`).
- `RATE_LIMIT_PER_MINUTE`: In-memory per-IP limit for `POST /predict` (default `30`).
- `CORS_ALLOW_ORIGINS`: Comma-separated origins or `*`.

### Frontend (`frontend/.env`)

- `VITE_API_BASE_URL`: API base URL for split dev mode.
- `VITE_API_KEY`: Optional API key sent as `x-api-key`.

## Error Handling Implemented

- No file uploaded
- Invalid file type (non-image)
- Empty upload
- Oversized upload (HTTP 413)
- Invalid/missing API key when enabled (HTTP 401)
- Rate limit exceeded (HTTP 429)
- Prediction failure (500 with detail)

## Common Issues

### 1) `{"detail":"Method Not Allowed"}`

Cause:
- You are opening `/predict` in a browser tab (GET request), but endpoint expects POST.

Fix:
- Use `/docs` and execute POST `/predict`, or call via frontend upload.

### 2) Frontend not visible at `/`

Cause:
- `frontend/dist` is missing.

Fix:

```bash
cd frontend
npm run build
```

### 3) Model file not found

Cause:
- `backend/model/best.pt` missing.

Fix:
- Ensure model exists at exactly `backend/model/best.pt`.

## Development Mode (Optional)

If you want to run frontend and backend separately:

Backend:

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm run dev
```

Then use frontend at http://localhost:5173 and API at http://127.0.0.1:8000.

## Production Tips

- Replace permissive CORS (`*`) with specific allowed origins.
- Put FastAPI behind a reverse proxy (Nginx/Caddy) for TLS.
- Add request size limits and auth if exposing externally.
- Store model and outputs on managed storage for scaling.
