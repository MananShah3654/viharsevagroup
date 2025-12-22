"""
Background Task System for PDF Generation
Handles async PDF generation to prevent blocking requests
"""
import asyncio
import uuid
from datetime import datetime, timezone
from typing import Dict, Optional
from fastapi import BackgroundTasks
import logging

logger = logging.getLogger(__name__)

# In-memory task store (use Redis for distributed systems)
task_store: Dict[str, Dict] = {}

class BackgroundTaskManager:
    """Manages background tasks for PDF generation"""
    
    @staticmethod
    async def create_task(task_type: str, task_data: dict) -> str:
        """Create a new background task and return task ID"""
        task_id = str(uuid.uuid4())
        task_store[task_id] = {
            "id": task_id,
            "type": task_type,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "data": task_data,
            "result": None,
            "error": None
        }
        logger.info(f"Created background task: {task_id} (type: {task_type})")
        return task_id
    
    @staticmethod
    async def update_task_status(task_id: str, status: str, result: Optional[dict] = None, error: Optional[str] = None):
        """Update task status"""
        if task_id in task_store:
            task_store[task_id]["status"] = status
            task_store[task_id]["updated_at"] = datetime.now(timezone.utc).isoformat()
            if result:
                task_store[task_id]["result"] = result
            if error:
                task_store[task_id]["error"] = error
            logger.info(f"Updated task {task_id} status: {status}")
    
    @staticmethod
    async def get_task(task_id: str) -> Optional[Dict]:
        """Get task by ID"""
        return task_store.get(task_id)
    
    @staticmethod
    async def cleanup_old_tasks(max_age_hours: int = 24):
        """Clean up tasks older than max_age_hours"""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
        to_remove = []
        
        for task_id, task in task_store.items():
            created_at = datetime.fromisoformat(task["created_at"].replace('Z', '+00:00'))
            if created_at < cutoff:
                to_remove.append(task_id)
        
        for task_id in to_remove:
            del task_store[task_id]
        
        if to_remove:
            logger.info(f"Cleaned up {len(to_remove)} old tasks")
    
    @staticmethod
    async def run_pdf_generation_task(task_id: str, generate_pdf_func, *args, **kwargs):
        """Run PDF generation in background"""
        try:
            await BackgroundTaskManager.update_task_status(task_id, "processing")
            logger.info(f"Starting PDF generation for task: {task_id}")
            
            # Generate PDF (this is the actual PDF generation function)
            result = await generate_pdf_func(*args, **kwargs)
            
            await BackgroundTaskManager.update_task_status(
                task_id, 
                "completed", 
                result={"pdf_data": result}
            )
            logger.info(f"PDF generation completed for task: {task_id}")
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"PDF generation failed for task {task_id}: {error_msg}")
            await BackgroundTaskManager.update_task_status(
                task_id, 
                "failed", 
                error=error_msg
            )

# Global task manager instance
task_manager = BackgroundTaskManager()

# Periodic cleanup task
async def periodic_cleanup():
    """Periodically clean up old tasks"""
    while True:
        await asyncio.sleep(3600)  # Run every hour
        await task_manager.cleanup_old_tasks()

# Start cleanup task on app startup
def start_background_cleanup():
    """Start the background cleanup task"""
    asyncio.create_task(periodic_cleanup())





