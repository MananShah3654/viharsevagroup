"""
Vercel serverless function entry point for FastAPI
Uses Mangum to bridge AWS Lambda (Vercel's runtime) with the FastAPI ASGI app.
"""

import sys
from pathlib import Path

# From api/ directory, backend/ is at ../backend/
backend_dir = Path(__file__).parent.parent / "backend"
backend_dir = backend_dir.resolve()
sys.path.insert(0, str(backend_dir))

# Import the FastAPI app from backend/server.py
from server import app as fastapi_app
from mangum import Mangum

# Mangum wraps the ASGI app for Lambda/Vercel invocation
handler = Mangum(fastapi_app, lifespan="off")

# Also export app for any direct ASGI callers
app = fastapi_app
