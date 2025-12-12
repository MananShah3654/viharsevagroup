"""
Vercel serverless function entry point for FastAPI
This file is used when deploying to Vercel

Vercel supports ASGI apps directly, so we can use the FastAPI app directly
without needing Mangum. However, we need to wrap it properly for Vercel's
Python runtime which expects a specific handler format.
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
    
    # Create Mangum handler - this converts ASGI to AWS Lambda format
    # Vercel's Python runtime runs on AWS Lambda under the hood
    mangum_handler = Mangum(app, lifespan="off")
    
    # Vercel expects a handler function that takes (event, context)
    # The Mangum instance IS callable, but Vercel's detection code
    # tries to inspect it and fails. We need to wrap it in a way
    # that Vercel can properly detect and invoke.
    
    # Solution: Create a simple wrapper function that Vercel can recognize
    async def handler(event, context):
        """
        Vercel-compatible handler wrapper.
        
        Vercel's Python runtime expects a function (not a class instance)
        that can be called with (event, context). Mangum instances are
        callable, but Vercel's type detection fails when inspecting them.
        
        This wrapper ensures Vercel can properly detect and invoke the handler.
        """
        # Mangum handlers are async callables that take (event, context)
        # We need to await the result since Mangum returns a coroutine
        return await mangum_handler(event, context)
    
    print("Handler created successfully")
    print(f"Mangum handler type: {type(mangum_handler)}")
    print(f"Wrapper handler type: {type(handler)}")
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
    
    mangum_error_handler = Mangum(error_app, lifespan="off")
    
    async def handler(event, context):
        return await mangum_error_handler(event, context)

# Export handler for Vercel - ensure it's at module level
__all__ = ['handler']
