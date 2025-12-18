"""
In-memory caching layer for frequently accessed data
Can be replaced with Redis for distributed systems
"""
from typing import Optional, Any
from datetime import datetime, timedelta
import asyncio
from collections import OrderedDict

class CacheItem:
    def __init__(self, value: Any, ttl: int = 300):
        self.value = value
        self.expires_at = datetime.now() + timedelta(seconds=ttl)
    
    def is_expired(self) -> bool:
        return datetime.now() > self.expires_at

class LRUCache:
    """Thread-safe LRU cache with TTL support"""
    def __init__(self, max_size: int = 1000, default_ttl: int = 300):
        self.cache: OrderedDict = OrderedDict()
        self.max_size = max_size
        self.default_ttl = default_ttl
        self.lock = asyncio.Lock()
    
    async def get(self, key: str) -> Optional[Any]:
        async with self.lock:
            if key not in self.cache:
                return None
            
            item = self.cache[key]
            if item.is_expired():
                del self.cache[key]
                return None
            
            # Move to end (most recently used)
            self.cache.move_to_end(key)
            return item.value
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None):
        async with self.lock:
            # Remove expired items if cache is full
            if len(self.cache) >= self.max_size:
                # Remove oldest item
                self.cache.popitem(last=False)
            
            ttl = ttl or self.default_ttl
            self.cache[key] = CacheItem(value, ttl)
            # Move to end (most recently used)
            self.cache.move_to_end(key)
    
    async def delete(self, key: str):
        async with self.lock:
            if key in self.cache:
                del self.cache[key]
    
    async def clear(self):
        async with self.lock:
            self.cache.clear()
    
    async def cleanup_expired(self):
        """Remove expired items"""
        async with self.lock:
            expired_keys = [
                key for key, item in self.cache.items()
                if item.is_expired()
            ]
            for key in expired_keys:
                del self.cache[key]

# Global cache instance
cache = LRUCache(max_size=2000, default_ttl=300)  # 5 min default TTL

# Cache key generators
def cache_key_user(user_id: str) -> str:
    return f"user:{user_id}"

def cache_key_vihars_list(filters: dict = None) -> str:
    filter_str = "_".join(f"{k}:{v}" for k, v in sorted((filters or {}).items()))
    return f"vihars:list:{filter_str}"

def cache_key_vihar(vihar_id: str) -> str:
    return f"vihar:{vihar_id}"

def cache_key_participants(vihar_id: str) -> str:
    return f"participants:{vihar_id}"

def cache_key_reports(period: str, user_id: str = None) -> str:
    return f"reports:{period}:{user_id or 'all'}"

