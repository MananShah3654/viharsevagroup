"""
Vercel serverless function entry point for FastAPI

Vercel supports ASGI apps directly, so we just need to expose the FastAPI
`app` object at module level. No Mangum, no custom handler wrapper.
"""

import sys
from pathlib import Path

# From api/ directory, backend/ is at ../backend/
backend_dir = Path(__file__).parent.parent / "backend"
backend_dir = backend_dir.resolve()
sys.path.insert(0, str(backend_dir))

# Optional: debug logs (helpful for Vercel logs)
print("Python path:", sys.path)
print("Backend dir:", backend_dir)
print("Backend dir exists:", backend_dir.exists())
print("Server.py exists:", (backend_dir / "server.py").exists())

# Import the FastAPI app from backend/server.py
from server import app as fastapi_app

# Vercel expects an ASGI app named `app`
app = fastapi_app
