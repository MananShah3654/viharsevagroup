"""
Vercel serverless function entry point for FastAPI
This file is used when deploying to Vercel
Uses Mangum adapter to convert FastAPI ASGI app to AWS Lambda handler
"""
import sys
from pathlib import Path

# Add backend directory to path to import server
# From api/ directory, backend/ is at ../backend/
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from server import app
from mangum import Mangum

# Create Mangum handler for Vercel serverless functions
handler = Mangum(app, lifespan="off")

# Export handler for Vercel
__all__ = ['handler', 'app']
