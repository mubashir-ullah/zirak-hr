from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pymongo.database import Database
from database import get_db, Database as DB
from routes.analytics import router as analytics_router
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Zirak HR Analytics API",
    description="Python backend for Zirak HR Analytics",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analytics_router)

@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection on startup"""
    DB.get_database()

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown"""
    DB.close_connection()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Zirak HR Analytics API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check(db: Database = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Check if database is connected
        db.command("ping")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status
    }

if __name__ == "__main__":
    # Get port from environment variable or use default
    port = int(os.getenv("PORT", 8000))
    
    # Run the FastAPI app with uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
