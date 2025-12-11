#!/bin/bash
# Startup script for production deployment

# Wait for MongoDB to be ready (if needed)
# You can add health checks here

# Start the server
exec uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}

