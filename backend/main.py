import os
import tempfile
import time
import uuid
import logging
from collections import defaultdict, deque
from pathlib import Path
from typing import Deque, Dict, List

import cv2
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field
from ultralytics import YOLO


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
MODEL_PATH = BASE_DIR / "model" / "best.pt"
OUTPUTS_DIR = BASE_DIR / "outputs"
FRONTEND_DIST_DIR = PROJECT_ROOT / "frontend" / "dist"
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.4"))
MAX_UPLOAD_SIZE_MB = float(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "30"))
XRAY_API_KEY = os.getenv("XRAY_API_KEY", "").strip()
_cors_raw = os.getenv("CORS_ALLOW_ORIGINS", "*").strip()
CORS_ALLOW_ORIGINS = [origin.strip() for origin in _cors_raw.split(",") if origin.strip()] or ["*"]
RATE_WINDOW_SECONDS = 60

logger = logging.getLogger("xray_api")
if not logger.handlers:
	logging.basicConfig(
		level=logging.INFO,
		format="%(asctime)s | %(levelname)s | %(message)s",
	)

_rate_limit_buckets: Dict[str, Deque[float]] = defaultdict(deque)

OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

if not MODEL_PATH.exists():
	raise FileNotFoundError(f"YOLO model not found at: {MODEL_PATH}")

model = YOLO(str(MODEL_PATH))


class Detection(BaseModel):
	model_config = ConfigDict(populate_by_name=True)

	class_name: str = Field(alias="class")
	confidence: float


class PredictResponse(BaseModel):
	status: str
	detections: List[Detection]
	output_image_path: str


app = FastAPI(
	title="AI X-ray Threat Detection API",
	description="FastAPI backend using YOLOv8 for X-ray threat detection.",
	version="1.0.0",
)

app.add_middleware(
	CORSMiddleware,
	allow_origins=CORS_ALLOW_ORIGINS,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)
app.mount("/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")


def _validate_api_key(request: Request) -> None:
	if not XRAY_API_KEY:
		return
	provided = request.headers.get("x-api-key", "").strip()
	if provided != XRAY_API_KEY:
		raise HTTPException(status_code=401, detail="Invalid or missing API key")


def _enforce_rate_limit(client_id: str) -> None:
	now = time.time()
	bucket = _rate_limit_buckets[client_id]

	while bucket and (now - bucket[0]) > RATE_WINDOW_SECONDS:
		bucket.popleft()

	if len(bucket) >= RATE_LIMIT_PER_MINUTE:
		raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again in a minute.")

	bucket.append(now)


@app.middleware("http")
async def log_requests(request: Request, call_next):
	start = time.perf_counter()
	try:
		response = await call_next(request)
	except Exception:
		elapsed_ms = (time.perf_counter() - start) * 1000
		logger.exception("%s %s -> 500 (%.2f ms)", request.method, request.url.path, elapsed_ms)
		raise

	elapsed_ms = (time.perf_counter() - start) * 1000
	logger.info("%s %s -> %s (%.2f ms)", request.method, request.url.path, response.status_code, elapsed_ms)
	return response


@app.get("/health")
def health_check() -> dict:
	return {
		"status": "ok",
		"model_loaded": True,
		"confidence_threshold": CONFIDENCE_THRESHOLD,
	}


@app.post("/predict", response_model=PredictResponse)
async def predict(request: Request, file: UploadFile = File(...)) -> PredictResponse:
	_validate_api_key(request)
	client_ip = request.client.host if request.client else "unknown"
	_enforce_rate_limit(client_ip)

	if not file:
		raise HTTPException(status_code=400, detail="No file uploaded")

	if not file.content_type or not file.content_type.startswith("image/"):
		raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image.")

	suffix = Path(file.filename or "image.jpg").suffix or ".jpg"
	temp_file_path = ""

	try:
		with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
			content = await file.read()
			if not content:
				raise HTTPException(status_code=400, detail="Uploaded file is empty")
			if len(content) > int(MAX_UPLOAD_SIZE_MB * 1024 * 1024):
				raise HTTPException(status_code=413, detail=f"Image too large. Max size is {MAX_UPLOAD_SIZE_MB} MB")
			temp_file.write(content)
			temp_file_path = temp_file.name

		results = model.predict(source=temp_file_path, conf=CONFIDENCE_THRESHOLD, verbose=False)
		result = results[0]

		detections = []
		threat_detected = False
		class_names = model.names if isinstance(model.names, dict) else {}

		if result.boxes is not None:
			for box in result.boxes:
				confidence = float(box.conf[0])
				class_id = int(box.cls[0])
				class_name = class_names.get(class_id, str(class_id))

				detections.append(
					{
						"class": class_name,
						"confidence": round(confidence, 4),
					}
				)

				if confidence > CONFIDENCE_THRESHOLD:
					threat_detected = True

		status = "THREAT" if threat_detected else "SAFE"

		plotted = result.plot()
		output_name = f"prediction_{uuid.uuid4().hex}.jpg"
		output_path = OUTPUTS_DIR / output_name
		cv2.imwrite(str(output_path), plotted)

		return PredictResponse(
			status=status,
			detections=[Detection(**item) for item in detections],
			output_image_path=f"/outputs/{output_name}",
		)

	except HTTPException:
		raise
	except Exception as exc:
		raise HTTPException(status_code=500, detail=f"Prediction failed: {str(exc)}") from exc
	finally:
		if temp_file_path and os.path.exists(temp_file_path):
			os.remove(temp_file_path)


@app.get("/", include_in_schema=False, response_model=None)
def serve_frontend_root():
	"""Serve the React app from the backend for a single-origin deployment."""
	index_file = FRONTEND_DIST_DIR / "index.html"
	if index_file.exists():
		return FileResponse(index_file)
	return {
		"message": "Frontend build not found. Run 'npm run build' inside frontend/ first.",
	}


@app.get("/{full_path:path}", include_in_schema=False, response_model=None)
def serve_frontend_assets(full_path: str):
	"""Serve built frontend assets and SPA routes from FastAPI."""
	if full_path.startswith(("predict", "health", "docs", "openapi.json", "redoc", "outputs")):
		raise HTTPException(status_code=404, detail="Not Found")

	requested_path = FRONTEND_DIST_DIR / full_path
	index_file = FRONTEND_DIST_DIR / "index.html"

	if requested_path.exists() and requested_path.is_file():
		return FileResponse(requested_path)

	if index_file.exists():
		return FileResponse(index_file)

	return {
		"message": "Frontend build not found. Run 'npm run build' inside frontend/ first.",
	}
