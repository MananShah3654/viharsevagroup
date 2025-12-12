"""
Vercel serverless function entry point for FastAPI
This file is used when deploying to Vercel
Uses Mangum adapter to convert FastAPI ASGI app to AWS Lambda handler
"""
import sys
import os
import traceback
from pathlib import Path

# Add backend directory to path to import server
# From api/ directory, backend/ is at ../backend/
backend_dir = Path(__file__).parent.parent / "backend"
backend_dir = backend_dir.resolve()  # Resolve to absolute path
sys.path.insert(0, str(backend_dir))

# Debug: Print paths for troubleshooting
print(f"Python path: {sys.path}")
print(f"Backend dir: {backend_dir}")
print(f"Backend dir exists: {backend_dir.exists()}")
print(f"Server.py exists: {(backend_dir / 'server.py').exists()}")

try:
    from server import app
    from mangum import Mangum
    
    # Create Mangum handler for Vercel serverless functions
    # Use lifespan="off" - Vercel may have issues with lifespan="on"
    # MongoDB connection will be established on first request
    handler = Mangum(app, lifespan="off")
    
    print("Handler created successfully")
    print(f"Handler type: {type(handler)}")
    print(f"Handler callable: {callable(handler)}")
    
except Exception as e:
    print(f"Error importing server or creating handler: {str(e)}")
    print(f"Traceback: {traceback.format_exc()}")
    # Create a minimal error handler
    from mangum import Mangum
    from fastapi import FastAPI
    
    error_app = FastAPI()
    
    @error_app.get("/{full_path:path}")
    async def error_handler(full_path: str):
        return {
            "error": "Server initialization failed",
            "message": str(e),
            "traceback": traceback.format_exc()
        }
    
    handler = Mangum(error_app, lifespan="off")

# Export handler for Vercel - ensure it's at module level
__all__ = ['handler']
