"""
Vercel serverless function entry point for FastAPI
Expose ASGI app as `app` (no Mangum handler on Vercel).
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from server import app  # FastAPI instance

__all__ = ["app"]