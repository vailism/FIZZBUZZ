# FIZZBUZZ Backend API

FastAPI backend service powering the YOLOv8 X-ray threat detection pipeline.

## Features

- **FastAPI Core**: High-throughput asynchronous endpoints for image and video inference.
- **YOLOv8 Model Integration**: Custom-trained model (`Best.pt`) for real-time luggage & cargo threat identification.
- **Annotated Image Streaming**: Automatic bounding box rendering, confidence scoring, and JSON metadata response.

## Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check and API version info |
| `POST` | `/predict/image` | Upload an X-ray image for instant threat detection |
| `POST` | `/predict/video` | Upload video feed for frame-by-frame inference |

## Setup & Running

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
