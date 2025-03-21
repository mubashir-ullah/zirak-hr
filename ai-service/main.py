from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
import json
from typing import List, Optional
from pydantic import BaseModel
import fitz  # PyMuPDF
import docx
import openai
from sentence_transformers import SentenceTransformer
import numpy as np

# Load environment variables
load_dotenv()

# Initialize OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Initialize FastAPI app
app = FastAPI(title="Zirak HR AI Service", 
              description="AI service for resume parsing, job matching, and skill assessment")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize sentence transformer model for embeddings
model = SentenceTransformer('all-MiniLM-L6-v2')

# Pydantic models for request/response validation
class ProfileData(BaseModel):
    fullName: Optional[str] = None
    email: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    germanLevel: Optional[str] = None
    availability: Optional[str] = None
    visaRequired: Optional[bool] = None
    visaType: Optional[str] = None
    linkedinUrl: Optional[str] = None
    githubUrl: Optional[str] = None
    resumeText: Optional[str] = None

class SkillSuggestion(BaseModel):
    skills: List[str]
    confidence: List[float]

class JobMatch(BaseModel):
    jobId: str
    title: str
    matchScore: float

# Helper functions
def extract_text_from_pdf(file_content):
    """Extract text from PDF file content"""
    try:
        with fitz.open(stream=file_content, filetype="pdf") as doc:
            text = ""
            for page in doc:
                text += page.get_text()
            return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {str(e)}")

def extract_text_from_docx(file_content):
    """Extract text from DOCX file content"""
    try:
        doc = docx.Document(file_content)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from DOCX: {str(e)}")

def parse_resume_with_llm(text):
    """Use OpenAI to parse resume text into structured data"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are a resume parsing assistant. Extract the following information from the resume text:
                - Full Name
                - Email
                - Skills (as a list)
                - Years of Experience
                - Country
                - City
                - German Language Level (None, A1, A2, B1, B2, C1, C2, or Native)
                - Availability
                - LinkedIn URL
                - GitHub URL
                
                Format your response as a valid JSON object with these keys: fullName, email, skills, experience, country, city, germanLevel, availability, linkedinUrl, githubUrl.
                For skills, return an array of strings. For experience, return the number of years as a string."""},
                {"role": "user", "content": text}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        parsed_data = json.loads(response.choices[0].message.content)
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing resume with LLM: {str(e)}")

def suggest_skills_with_llm(resume_text, current_skills):
    """Use OpenAI to suggest additional skills based on resume text and current skills"""
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are a career advisor specialized in tech skills. 
                Based on the resume text and current skills, suggest additional relevant skills that would enhance the candidate's profile.
                Focus on technical skills, tools, frameworks, and methodologies that are in demand in the job market.
                Return only a JSON array of strings with the suggested skills. Do not include any of the current skills in your suggestions."""},
                {"role": "user", "content": f"Resume text: {resume_text}\n\nCurrent skills: {', '.join(current_skills)}"}
            ],
            temperature=0.5,
            max_tokens=500
        )
        suggested_skills = json.loads(response.choices[0].message.content)
        # Calculate confidence scores (simplified)
        confidence_scores = [0.9 - (i * 0.05) for i in range(len(suggested_skills))]
        confidence_scores = [max(score, 0.5) for score in confidence_scores]  # Ensure minimum 0.5 confidence
        
        return {"skills": suggested_skills, "confidence": confidence_scores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error suggesting skills with LLM: {str(e)}")

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to Zirak HR AI Service"}

@app.post("/parse-resume/", response_model=ProfileData)
async def parse_resume_endpoint(file: UploadFile = File(...)):
    """Parse resume file (PDF or DOCX) and extract structured information"""
    try:
        contents = await file.read()
        
        # Extract text based on file type
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(contents)
        elif file.filename.endswith('.docx'):
            text = extract_text_from_docx(contents)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF or DOCX file.")
        
        # Parse resume text with LLM
        parsed_data = parse_resume_with_llm(text)
        parsed_data["resumeText"] = text  # Include the full text for reference
        
        return parsed_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/suggest-skills/", response_model=SkillSuggestion)
async def suggest_skills_endpoint(profile_data: ProfileData):
    """Suggest additional skills based on resume text and current skills"""
    if not profile_data.resumeText:
        raise HTTPException(status_code=400, detail="Resume text is required")
    
    current_skills = profile_data.skills or []
    suggestions = suggest_skills_with_llm(profile_data.resumeText, current_skills)
    
    return suggestions

@app.post("/generate-quiz/")
async def generate_quiz_endpoint(skills: List[str]):
    """Generate quiz questions based on user skills"""
    try:
        if not skills or len(skills) == 0:
            raise HTTPException(status_code=400, detail="At least one skill is required")
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": """You are a technical assessment creator. 
                Generate 3 multiple-choice questions for each skill provided.
                Each question should have 4 options with one correct answer.
                Format your response as a JSON array of objects, where each object has:
                - skill: the skill being tested
                - question: the question text
                - options: array of 4 possible answers
                - correctAnswer: the index (0-3) of the correct answer
                - explanation: brief explanation of why the answer is correct"""},
                {"role": "user", "content": f"Skills: {', '.join(skills)}"}
            ],
            temperature=0.7,
            max_tokens=2000
        )
        
        quiz_data = json.loads(response.choices[0].message.content)
        return {"quiz": quiz_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")

@app.post("/job-match-score/")
async def job_match_score_endpoint(profile_data: ProfileData, job_description: str):
    """Calculate match score between profile and job description"""
    try:
        # Create profile embedding
        profile_text = f"{profile_data.fullName} {' '.join(profile_data.skills or [])} {profile_data.experience} {profile_data.resumeText or ''}"
        profile_embedding = model.encode(profile_text)
        
        # Create job embedding
        job_embedding = model.encode(job_description)
        
        # Calculate cosine similarity
        similarity = np.dot(profile_embedding, job_embedding) / (np.linalg.norm(profile_embedding) * np.linalg.norm(job_embedding))
        
        # Convert to percentage
        match_score = float(similarity * 100)
        
        return {"matchScore": match_score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating match score: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
