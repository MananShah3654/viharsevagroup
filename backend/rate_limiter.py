"""
Rate Limiting Middleware
Prevents abuse and ensures fair resource usage
"""
from collections import defaultdict
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import asyncio

class RateLimiter:
    """Simple in-memory rate limiter (use Redis for distributed systems)"""
    def __init__(self):
        self.requests = defaultdict(list)
        self.lock = asyncio.Lock()
    
    async def is_allowed(self, key: str, max_requests: int, window_seconds: int) -> bool:
        """Check if request is allowed"""
        async with self.lock:
            now = datetime.now()
            window_start = now - timedelta(seconds=window_seconds)
            
            # Clean old requests
            self.requests[key] = [
                req_time for req_time in self.requests[key]
                if req_time > window_start
            ]
            
            # Check limit
            if len(self.requests[key]) >= max_requests:
                return False
            
            # Add current request
            self.requests[key].append(now)
            return True

# Global rate limiter instance
rate_limiter = RateLimiter()

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware"""
    def __init__(self, app, default_limit: int = 100, window: int = 60):
        super().__init__(app)
        self.default_limit = default_limit
        self.window = window
        
        # Different limits for different endpoints
        self.endpoint_limits = {
            "/api/auth/login": (10, 60),  # 10 requests per minute
            "/api/auth/register": (5, 60),  # 5 requests per minute
            "/api/reports/download": (20, 60),  # 20 requests per minute
            "/api/vihar-path/route1/pdf": (10, 60),  # 10 PDFs per minute
        }
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for OPTIONS requests
        if request.method == "OPTIONS":
            return await call_next(request)
        
        # Get client identifier (IP or user ID)
        client_ip = request.client.host if request.client else "unknown"
        
        # Get endpoint-specific limit
        path = request.url.path
        max_requests, window = self.endpoint_limits.get(path, (self.default_limit, self.window))
        
        # Create rate limit key
        rate_key = f"{client_ip}:{path}"
        
        # Check rate limit
        if not await rate_limiter.is_allowed(rate_key, max_requests, window):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {max_requests} requests per {window} seconds."
            )
        
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(max_requests)
        response.headers["X-RateLimit-Window"] = str(window)
        
        return response

