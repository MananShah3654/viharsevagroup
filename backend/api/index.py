"""
Vercel serverless function entry point for FastAPI
This file is used when deploying to Vercel
Uses Mangum adapter to convert FastAPI ASGI app to AWS Lambda handler
"""
import sys
from pathlib import Path

# Add parent directory to path to import server
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from server import app
from mangum import Mangum

# Create Mangum handler for Vercel serverless functions
handler = Mangum(app, lifespan="off")

# Export handler for Vercel
__all__ = ['handler', 'app']
