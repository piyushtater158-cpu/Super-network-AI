from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import asyncio
from functools import partial
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import google.genai as genai
from google.genai import types as genai_types
from google.oauth2 import service_account as _sa
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ==================== FIREBASE INIT ====================
_cred_path = ROOT_DIR / 'firebase_credentials.json'
cred = credentials.Certificate(str(_cred_path))
firebase_admin.initialize_app(cred)
db = firestore.client()

# ==================== GEMINI CLIENT (Vertex AI mode — uses service account, no separate API key) ====================
_FIREBASE_PROJECT_ID = "super-networking-ai"
try:
    gemini_client = genai.Client(
        vertexai=True,
        project=_FIREBASE_PROJECT_ID,
        location="us-central1",
        credentials=_sa.Credentials.from_service_account_file(
            str(_cred_path),
            scopes=["https://www.googleapis.com/auth/cloud-platform"]
        )
    )
    GEMINI_ENABLED = True
    logging.getLogger(__name__).info("Gemini client initialized via Vertex AI (service account)")
except Exception as _e:
    gemini_client = None
    GEMINI_ENABLED = False
    logging.getLogger(__name__).warning(f"Gemini disabled: {_e}")

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== ASYNC FIRESTORE HELPER ====================

async def run_sync(fn, *args, **kwargs):
    """Run a synchronous Firestore call in a thread pool executor."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, partial(fn, *args, **kwargs))

# ==================== MODELS ====================

class MatchingPreferences(BaseModel):
    model_config = ConfigDict(extra="ignore")
    skills: List[str] = []
    interests: List[str] = []
    working_style: str = "Flexible"
    team_preference: str = "Flexible"
    hours_per_week: int = 40
    domains: List[str] = []

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role_labels: List[str] = []
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    primary_intent: str = "Freelance/Gigs"
    secondary_intents: List[str] = []
    availability: str = "Available now"
    available_from: Optional[str] = None
    onboarding_completed: bool = False
    is_public: bool = True
    blocked_users: List[str] = []
    matching_preferences: MatchingPreferences = Field(default_factory=MatchingPreferences)
    peer_score: float = 0.0
    recruiter_score: float = 0.0
    total_gigs: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserUpdate(BaseModel):
    role_labels: Optional[List[str]] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    primary_intent: Optional[str] = None
    secondary_intents: Optional[List[str]] = None
    availability: Optional[str] = None
    available_from: Optional[str] = None
    is_public: Optional[bool] = None
    blocked_users: Optional[List[str]] = None
    matching_preferences: Optional[MatchingPreferences] = None

class IkigaiProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    ikigai_id: str = Field(default_factory=lambda: f"ikigai_{uuid.uuid4().hex[:12]}")
    user_id: str
    what_i_love: List[str] = []
    what_im_good_at: List[str] = []
    what_i_can_be_paid_for: List[str] = []
    what_the_world_needs: List[str] = []
    ikigai_statement: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class IkigaiCreate(BaseModel):
    what_i_love: List[str] = []
    what_im_good_at: List[str] = []
    what_i_can_be_paid_for: List[str] = []
    what_the_world_needs: List[str] = []

class Opportunity(BaseModel):
    model_config = ConfigDict(extra="ignore")
    opportunity_id: str = Field(default_factory=lambda: f"opp_{uuid.uuid4().hex[:12]}")
    creator_id: str
    creator_name: str
    creator_picture: Optional[str] = None
    type: str  # "gig" or "job"
    title: str
    description: str
    skills_required: List[str] = []
    compensation_type: str = "Negotiable"
    compensation_amount: Optional[str] = None
    timeline: Optional[str] = None
    status: str = "open"  # open, in_progress, completed, closed
    applications_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OpportunityCreate(BaseModel):
    type: str
    title: str
    description: str
    skills_required: List[str] = []
    compensation_type: str = "Negotiable"
    compensation_amount: Optional[str] = None
    timeline: Optional[str] = None

class Application(BaseModel):
    model_config = ConfigDict(extra="ignore")
    application_id: str = Field(default_factory=lambda: f"app_{uuid.uuid4().hex[:12]}")
    opportunity_id: str
    applicant_id: str
    applicant_name: str
    applicant_picture: Optional[str] = None
    cover_message: Optional[str] = None
    status: str = "pending"  # pending, accepted, rejected
    match_score: Optional[float] = None
    match_reasoning: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ApplicationCreate(BaseModel):
    opportunity_id: str
    cover_message: Optional[str] = None

class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message_id: str = Field(default_factory=lambda: f"msg_{uuid.uuid4().hex[:12]}")
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_picture: Optional[str] = None
    content: str
    read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MessageCreate(BaseModel):
    receiver_id: str
    content: str

class Conversation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    conversation_id: str = Field(default_factory=lambda: f"conv_{uuid.uuid4().hex[:12]}")
    participants: List[str]
    participant_names: Dict[str, str] = {}
    participant_pictures: Dict[str, str] = {}
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: Dict[str, int] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Rating(BaseModel):
    model_config = ConfigDict(extra="ignore")
    rating_id: str = Field(default_factory=lambda: f"rating_{uuid.uuid4().hex[:12]}")
    rater_id: str
    rated_user_id: str
    opportunity_id: Optional[str] = None
    rater_type: str = "peer"  # "peer" or "recruiter"
    collaboration: int = Field(ge=1, le=10)
    reliability: int = Field(ge=1, le=10)
    skill_quality: int = Field(ge=1, le=10)
    culture_fit: int = Field(ge=1, le=10)
    professionalism: int = Field(ge=1, le=10)
    would_work_again: bool = True
    comments: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RatingCreate(BaseModel):
    rated_user_id: str
    opportunity_id: Optional[str] = None
    collaboration: int = Field(ge=1, le=10)
    reliability: int = Field(ge=1, le=10)
    skill_quality: int = Field(ge=1, le=10)
    culture_fit: int = Field(ge=1, le=10)
    professionalism: int = Field(ge=1, le=10)
    would_work_again: bool = True
    comments: Optional[str] = None

class SearchQuery(BaseModel):
    query: str
    intent_filter: Optional[str] = None
    availability_filter: Optional[str] = None

# ==================== FIRESTORE UTILITY FUNCTIONS ====================

def _doc_to_dict(doc_snapshot) -> Optional[dict]:
    """Convert a Firestore DocumentSnapshot to a plain dict, or None if not found."""
    if not doc_snapshot.exists:
        return None
    return doc_snapshot.to_dict()

def _docs_to_list(query_snapshot) -> List[dict]:
    """Convert a Firestore query result to a list of plain dicts."""
    return [doc.to_dict() for doc in query_snapshot]

# ==================== AUTH HELPERS ====================

async def get_current_user(request: Request) -> User:
    """Get current user from session token in cookies or Authorization header"""
    session_token = request.cookies.get("session_token")

    if not session_token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            session_token = auth_header[7:]

    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Find session in Firestore
    session_ref = db.collection('user_sessions').document(session_token)
    session_doc = await run_sync(session_ref.get)
    session_data = _doc_to_dict(session_doc)

    if not session_data:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Check expiry
    expires_at = session_data.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    # Get user
    user_id = session_data.get("user_id")
    user_ref = db.collection('users').document(user_id)
    user_doc = await run_sync(user_ref.get)
    user_data = _doc_to_dict(user_doc)

    if not user_data:
        raise HTTPException(status_code=401, detail="User not found")

    return User(**user_data)

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange Firebase ID token for a session token"""
    body = await request.json()
    id_token = body.get("id_token")

    if not id_token:
        raise HTTPException(status_code=400, detail="id_token required")

    # Verify the Firebase ID token
    try:
        def _verify():
            return firebase_auth.verify_id_token(id_token)
        decoded_token = await run_sync(_verify)
    except Exception as e:
        logger.error(f"Firebase token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired ID token")

    email = decoded_token.get("email")
    name = decoded_token.get("name", email)
    picture = decoded_token.get("picture")
    # Use the Firebase UID as the session token (stable, unique per user)
    session_token = decoded_token.get("uid")

    # Check if user exists (query by email)
    def _find_user_by_email():
        docs = db.collection('users').where('email', '==', email).limit(1).get()
        results = list(docs)
        return results[0].to_dict() if results else None

    existing_user = await run_sync(_find_user_by_email)

    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info
        user_ref = db.collection('users').document(user_id)
        await run_sync(user_ref.update, {"name": name, "picture": picture})
    else:
        # Create new user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        new_user = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "role_labels": [],
            "location": None,
            "linkedin_url": None,
            "github_url": None,
            "portfolio_url": None,
            "primary_intent": "Freelance/Gigs",
            "secondary_intents": [],
            "availability": "Available now",
            "available_from": None,
            "onboarding_completed": False,
            "peer_score": 0.0,
            "recruiter_score": 0.0,
            "total_gigs": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        user_ref = db.collection('users').document(user_id)
        await run_sync(user_ref.set, new_user)

    # Store session in Firestore (document ID = session_token for O(1) lookup)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    session_ref = db.collection('user_sessions').document(session_token)
    await run_sync(session_ref.set, session_doc)

    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )

    # Return full user data
    user_ref = db.collection('users').document(user_id)
    user_doc = await run_sync(user_ref.get)
    user_data = _doc_to_dict(user_doc)

    return {"user": user_data}

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current user data"""
    # Also get ikigai profile
    ikigai_ref = db.collection('ikigai_profiles').document(user.user_id)
    ikigai_doc = await run_sync(ikigai_ref.get)
    ikigai = _doc_to_dict(ikigai_doc)

    user_dict = user.model_dump()
    user_dict["ikigai"] = ikigai

    return user_dict

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")

    if session_token:
        session_ref = db.collection('user_sessions').document(session_token)
        await run_sync(session_ref.delete)

    response.delete_cookie(key="session_token", path="/")

    return {"message": "Logged out"}

# ==================== USER ENDPOINTS ====================

@api_router.get("/users/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get public user profile"""
    user_ref = db.collection('users').document(user_id)
    user_doc = await run_sync(user_ref.get)
    user_data = _doc_to_dict(user_doc)

    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    # Get ikigai
    ikigai_ref = db.collection('ikigai_profiles').document(user_id)
    ikigai_doc = await run_sync(ikigai_ref.get)
    ikigai = _doc_to_dict(ikigai_doc)

    # Get ratings
    def _get_ratings():
        docs = db.collection('ratings').where('rated_user_id', '==', user_id).limit(100).get()
        return [d.to_dict() for d in docs]

    ratings = await run_sync(_get_ratings)

    return {
        "user": user_data,
        "ikigai": ikigai,
        "ratings": ratings
    }

@api_router.put("/users/profile")
async def update_profile(updates: UserUpdate, user: User = Depends(get_current_user)):
    """Update user profile"""
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}

    if update_dict:
        user_ref = db.collection('users').document(user.user_id)
        await run_sync(user_ref.update, update_dict)

    user_ref = db.collection('users').document(user.user_id)
    user_doc = await run_sync(user_ref.get)
    return _doc_to_dict(user_doc)

@api_router.get("/users/recalibration-prompts")
async def get_recalibration_prompts(user: User = Depends(get_current_user)):
    """Get pending recalibration prompts"""
    def _query():
        docs = db.collection('users').document(user.user_id).collection('recalibration_prompts').where('status', '==', 'pending').get()
        return [d.to_dict() for d in docs]
    return await run_sync(_query)

@api_router.put("/users/recalibration-prompts/{prompt_id}")
async def update_recalibration_prompt(prompt_id: str, payload: dict, user: User = Depends(get_current_user)):
    """Accept or dismiss prompt"""
    status = payload.get("status") # 'accepted' or 'dismissed'
    ref = db.collection('users').document(user.user_id).collection('recalibration_prompts').document(prompt_id)
    await run_sync(ref.update, {"status": status})
    return {"status": status}

@api_router.get("/users/leaderboard")
async def get_leaderboard(view: str = "peer", limit: int = 20):
    """Get leaderboard by peer or recruiter score"""
    sort_field = "peer_score" if view == "peer" else "recruiter_score"

    def _query():
        docs = (
            db.collection('users')
            .where('onboarding_completed', '==', True)
            .where('is_public', '==', True)
            .order_by(sort_field, direction=firestore.Query.DESCENDING)
            .limit(limit)
            .get()
        )
        return [d.to_dict() for d in docs]

    users = await run_sync(_query)

    # Add rank
    for i, u in enumerate(users):
        u["rank"] = i + 1

    return users

@api_router.post("/users/upload-cv")
async def upload_cv(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    """Parse CV/Resume and return pre-filled Ikigai & Skills"""
    if not GEMINI_ENABLED:
        raise HTTPException(status_code=500, detail="Gemini AI is disabled")
    
    content = await file.read()
    text = ""
    # Only try to parse if PDF
    if file.filename.endswith(".pdf"):
        import io
        from pypdf import PdfReader
        try:
            reader = PdfReader(io.BytesIO(content))
            for page in reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            logging.getLogger(__name__).error(f"Failed to parse PDF: {e}")
            raise HTTPException(status_code=400, detail="Invalid PDF file")
    else:
        text = content.decode("utf-8", errors="ignore")
        
    prompt = f"""You are an expert career coach. Analyze the following CV/Resume text and extract:
1. Skills (list of strings)
2. Roles / Titles (list of strings)
3. Suggested Ikigai entries based on this experience:
   - what_i_love
   - what_im_good_at
   - what_i_can_be_paid_for
   - what_the_world_needs

Return ONLY valid JSON in this exact structure:
{{
  "skills": ["...", "..."],
  "roles": ["...", "..."],
  "ikigai_suggestions": {{
      "what_i_love": ["...", "..."],
      "what_im_good_at": ["...", "..."],
      "what_i_can_be_paid_for": ["...", "..."],
      "what_the_world_needs": ["...", "..."]
  }}
}}

Resume Text:
{text}
"""
    try:
        response = await run_sync(
            gemini_client.models.generate_content,
            model="gemini-2.0-flash",
            contents=prompt
        )
        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        parsed = json.loads(response_text)
        
        # Save a flag so we know it was CV parsed
        user_ref = db.collection('users').document(user.user_id)
        await run_sync(user_ref.update, {"cv_parsed_data": True})
        
        return parsed
    except Exception as e:
        logging.getLogger(__name__).error(f"CV parsing failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse CV with AI")


@api_router.get("/users/{user_id}/export/json")
async def export_profile_json(user_id: str):
    """Export user data as JSON"""
    user_ref = db.collection('users').document(user_id)
    user_doc = await run_sync(user_ref.get)
    user_data = _doc_to_dict(user_doc)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
        
    ikigai_ref = db.collection('ikigai_profiles').document(user_id)
    ikigai_doc = await run_sync(ikigai_ref.get)
    ikigai = _doc_to_dict(ikigai_doc)
    
    return {"user": user_data, "ikigai": ikigai}


@api_router.get("/users/{user_id}/export/pdf")
async def export_profile_pdf(user_id: str):
    """Export user data as PDF"""
    user_ref = db.collection('users').document(user_id)
    user_doc = await run_sync(user_ref.get)
    user_data = _doc_to_dict(user_doc)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
        
    ikigai_ref = db.collection('ikigai_profiles').document(user_id)
    ikigai_doc = await run_sync(ikigai_ref.get)
    ikigai = _doc_to_dict(ikigai_doc) or {}
    
    import io
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from fastapi.responses import Response
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, f"SuperNetworkAI Profile: {user_data.get('name', 'Unknown')}")
    
    c.setFont("Helvetica", 12)
    y = height - 80
    c.drawString(50, y, f"Email: {user_data.get('email', '')}")
    c.drawString(50, y - 20, f"Intent: {user_data.get('primary_intent', '')}")
    c.drawString(50, y - 40, f"Availability: {user_data.get('availability', '')}")
    
    prefs = user_data.get("matching_preferences", {})
    if prefs:
        skills = ", ".join(prefs.get("skills", []))
        c.drawString(50, y - 60, f"Skills: {skills}")
        
    statement = ikigai.get("ikigai_statement", "")
    if statement:
        c.drawString(50, y - 90, "Ikigai Statement:")
        # Simple wrapping
        c.setFont("Helvetica-Oblique", 11)
        y_stmt = y - 110
        import textwrap
        for line in textwrap.wrap(statement, width=80):
            c.drawString(60, y_stmt, line)
            y_stmt -= 15
    
    c.save()
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=profile_{user_id}.pdf"})


# ==================== IKIGAI ENDPOINTS ====================

@api_router.post("/ikigai")
async def create_or_update_ikigai(ikigai_data: IkigaiCreate, user: User = Depends(get_current_user)):
    """Create or update Ikigai profile"""
    ikigai_ref = db.collection('ikigai_profiles').document(user.user_id)
    ikigai_doc = await run_sync(ikigai_ref.get)
    existing = _doc_to_dict(ikigai_doc)

    now = datetime.now(timezone.utc)

    if existing:
        # Update
        update_dict = ikigai_data.model_dump()
        update_dict["updated_at"] = now.isoformat()
        await run_sync(ikigai_ref.update, update_dict)
    else:
        # Create
        ikigai_doc_data = {
            "ikigai_id": f"ikigai_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            **ikigai_data.model_dump(),
            "ikigai_statement": None,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        await run_sync(ikigai_ref.set, ikigai_doc_data)

    # Mark onboarding complete
    user_ref = db.collection('users').document(user.user_id)
    await run_sync(user_ref.update, {"onboarding_completed": True})

    # Generate Ikigai statement with AI
    try:
        ikigai_statement = await generate_ikigai_statement(ikigai_data, user.name)
        await run_sync(ikigai_ref.update, {"ikigai_statement": ikigai_statement})
    except Exception as e:
        logger.error(f"Failed to generate Ikigai statement: {e}")

    ikigai_doc = await run_sync(ikigai_ref.get)
    return _doc_to_dict(ikigai_doc)

@api_router.get("/ikigai")
async def get_my_ikigai(user: User = Depends(get_current_user)):
    """Get current user's Ikigai profile"""
    ikigai_ref = db.collection('ikigai_profiles').document(user.user_id)
    ikigai_doc = await run_sync(ikigai_ref.get)
    ikigai = _doc_to_dict(ikigai_doc)
    return ikigai or {}

# ==================== OPPORTUNITY ENDPOINTS ====================

@api_router.post("/opportunities")
async def create_opportunity(opp_data: OpportunityCreate, user: User = Depends(get_current_user)):
    """Create a new opportunity (gig or job)"""
    opp = Opportunity(
        creator_id=user.user_id,
        creator_name=user.name,
        creator_picture=user.picture,
        **opp_data.model_dump()
    )

    opp_dict = opp.model_dump()
    opp_dict["created_at"] = opp_dict["created_at"].isoformat()

    opp_ref = db.collection('opportunities').document(opp.opportunity_id)
    await run_sync(opp_ref.set, opp_dict)

    return opp_dict

@api_router.get("/opportunities")
async def list_opportunities(
    type_filter: Optional[str] = None,
    status: str = "open",
    limit: int = 20,
    skip: int = 0
):
    """List opportunities with filters"""
    def _query():
        q = db.collection('opportunities').where('status', '==', status)
        if type_filter:
            q = q.where('type', '==', type_filter)
        q = q.order_by('created_at', direction=firestore.Query.DESCENDING)
        docs = q.get()
        all_docs = [d.to_dict() for d in docs]
        return all_docs[skip:skip + limit]

    opportunities = await run_sync(_query)
    return opportunities

@api_router.get("/opportunities/{opportunity_id}")
async def get_opportunity(opportunity_id: str):
    """Get single opportunity"""
    opp_ref = db.collection('opportunities').document(opportunity_id)
    opp_doc = await run_sync(opp_ref.get)
    opp = _doc_to_dict(opp_doc)

    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Get creator's ikigai
    ikigai_ref = db.collection('ikigai_profiles').document(opp["creator_id"])
    ikigai_doc = await run_sync(ikigai_ref.get)
    creator_ikigai = _doc_to_dict(ikigai_doc)

    opp["creator_ikigai"] = creator_ikigai

    return opp

@api_router.get("/opportunities/{opportunity_id}/candidates")
async def get_opportunity_candidates(opportunity_id: str, user: User = Depends(get_current_user)):
    """Get ranked candidates for an opportunity"""
    opp_ref = db.collection('opportunities').document(opportunity_id)
    opp_doc = await run_sync(opp_ref.get)
    opp = _doc_to_dict(opp_doc)

    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    if opp["creator_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    def _get_applications():
        docs = db.collection('applications').where('opportunity_id', '==', opportunity_id).limit(100).get()
        return [d.to_dict() for d in docs]

    applications = await run_sync(_get_applications)

    # Get AI-ranked candidates
    try:
        ranked_candidates = await rank_candidates_for_opportunity(opp, applications)
    except Exception as e:
        logger.error(f"Failed to rank candidates: {e}")
        ranked_candidates = applications

    return ranked_candidates

@api_router.post("/opportunities/{opportunity_id}/apply")
async def apply_to_opportunity(opportunity_id: str, app_data: ApplicationCreate, user: User = Depends(get_current_user)):
    """Apply to an opportunity"""
    opp_ref = db.collection('opportunities').document(opportunity_id)
    opp_doc = await run_sync(opp_ref.get)
    opp = _doc_to_dict(opp_doc)

    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Check if already applied
    def _check_existing():
        docs = (
            db.collection('applications')
            .where('opportunity_id', '==', opportunity_id)
            .where('applicant_id', '==', user.user_id)
            .limit(1)
            .get()
        )
        results = list(docs)
        return results[0].to_dict() if results else None

    existing = await run_sync(_check_existing)

    if existing:
        raise HTTPException(status_code=400, detail="Already applied")

    application = Application(
        opportunity_id=opportunity_id,
        applicant_id=user.user_id,
        applicant_name=user.name,
        applicant_picture=user.picture,
        cover_message=app_data.cover_message
    )

    app_dict = application.model_dump()
    app_dict["created_at"] = app_dict["created_at"].isoformat()

    app_ref = db.collection('applications').document(application.application_id)
    await run_sync(app_ref.set, app_dict)

    # Atomically increment applications_count
    await run_sync(
        opp_ref.update,
        {"applications_count": firestore.Increment(1)}
    )

    return app_dict

# ==================== SEARCH ENDPOINTS ====================

@api_router.post("/search/people")
async def search_people(search: SearchQuery, user: User = Depends(get_current_user)):
    """AI-powered natural language search for people"""
    try:
        results = await ai_search_people(search.query, search.intent_filter, search.availability_filter)
        return results
    except Exception as e:
        logger.error(f"Search failed: {e}")
        # Fallback to basic search
        def _basic_search():
            q = db.collection('users').where('onboarding_completed', '==', True)
            if search.intent_filter:
                q = q.where('primary_intent', '==', search.intent_filter)
            if search.availability_filter:
                q = q.where('availability', '==', search.availability_filter)
            docs = q.limit(20).get()
            return [d.to_dict() for d in docs]

        users = await run_sync(_basic_search)

        # Add ikigai to each user
        for u in users:
            ikigai_ref = db.collection('ikigai_profiles').document(u["user_id"])
            ikigai_doc = await run_sync(ikigai_ref.get)
            u["ikigai"] = _doc_to_dict(ikigai_doc)
            u["match_score"] = 0.5
            u["match_reasoning"] = "Based on profile match"

        return users

# ==================== MESSAGING ENDPOINTS ====================

@api_router.post("/messages")
async def send_message(msg_data: MessageCreate, user: User = Depends(get_current_user)):
    """Send a message"""
    receiver_ref = db.collection('users').document(msg_data.receiver_id)
    receiver_doc = await run_sync(receiver_ref.get)
    receiver = _doc_to_dict(receiver_doc)

    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    # Find or create conversation
    participants = sorted([user.user_id, msg_data.receiver_id])

    def _find_conversation():
        docs = (
            db.collection('conversations')
            .where('participants', '==', participants)
            .limit(1)
            .get()
        )
        results = list(docs)
        return results[0].to_dict() if results else None

    conv = await run_sync(_find_conversation)

    if not conv:
        new_conv = Conversation(
            participants=participants,
            participant_names={user.user_id: user.name, msg_data.receiver_id: receiver["name"]},
            participant_pictures={user.user_id: user.picture or "", msg_data.receiver_id: receiver.get("picture", "")},
            unread_count={user.user_id: 0, msg_data.receiver_id: 0}
        )
        conv_dict = new_conv.model_dump()
        conv_dict["created_at"] = conv_dict["created_at"].isoformat()
        conv_dict["last_message_at"] = None

        conv_ref = db.collection('conversations').document(new_conv.conversation_id)
        await run_sync(conv_ref.set, conv_dict)
        conv = conv_dict

    # Create message
    message = Message(
        conversation_id=conv["conversation_id"],
        sender_id=user.user_id,
        sender_name=user.name,
        sender_picture=user.picture,
        content=msg_data.content
    )

    msg_dict = message.model_dump()
    msg_dict["created_at"] = msg_dict["created_at"].isoformat()

    msg_ref = db.collection('messages').document(message.message_id)
    await run_sync(msg_ref.set, msg_dict)

    # Update conversation
    conv_ref = db.collection('conversations').document(conv["conversation_id"])
    await run_sync(
        conv_ref.update,
        {
            "last_message": msg_data.content[:100],
            "last_message_at": datetime.now(timezone.utc).isoformat(),
            f"unread_count.{msg_data.receiver_id}": firestore.Increment(1)
        }
    )

    return msg_dict

@api_router.get("/messages/conversations")
async def get_conversations(user: User = Depends(get_current_user)):
    """Get user's conversations"""
    def _query():
        docs = (
            db.collection('conversations')
            .where('participants', 'array_contains', user.user_id)
            .order_by('last_message_at', direction=firestore.Query.DESCENDING)
            .limit(50)
            .get()
        )
        return [d.to_dict() for d in docs]

    conversations = await run_sync(_query)
    return conversations

@api_router.get("/messages/{conversation_id}")
async def get_messages(conversation_id: str, user: User = Depends(get_current_user)):
    """Get messages in a conversation"""
    conv_ref = db.collection('conversations').document(conversation_id)
    conv_doc = await run_sync(conv_ref.get)
    conv = _doc_to_dict(conv_doc)

    if not conv or user.user_id not in conv["participants"]:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Mark as read — zero out unread count for current user
    await run_sync(
        conv_ref.update,
        {f"unread_count.{user.user_id}": 0}
    )

    def _get_messages():
        docs = (
            db.collection('messages')
            .where('conversation_id', '==', conversation_id)
            .order_by('created_at', direction=firestore.Query.ASCENDING)
            .limit(100)
            .get()
        )
        return [d.to_dict() for d in docs]

    messages = await run_sync(_get_messages)

    return {"conversation": conv, "messages": messages}

# ==================== RATING ENDPOINTS ====================

@api_router.post("/ratings")
async def create_rating(rating_data: RatingCreate, user: User = Depends(get_current_user)):
    """Create a rating for another user"""
    if rating_data.rated_user_id == user.user_id:
        raise HTTPException(status_code=400, detail="Cannot rate yourself")

    rated_user_ref = db.collection('users').document(rating_data.rated_user_id)
    rated_user_doc = await run_sync(rated_user_ref.get)
    rated_user = _doc_to_dict(rated_user_doc)

    if not rated_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Determine rater type
    rater_type = "recruiter" if "recruiter" in [r.lower() for r in user.role_labels] else "peer"

    rating = Rating(
        rater_id=user.user_id,
        rated_user_id=rating_data.rated_user_id,
        opportunity_id=rating_data.opportunity_id,
        rater_type=rater_type,
        collaboration=rating_data.collaboration,
        reliability=rating_data.reliability,
        skill_quality=rating_data.skill_quality,
        culture_fit=rating_data.culture_fit,
        professionalism=rating_data.professionalism,
        would_work_again=rating_data.would_work_again,
        comments=rating_data.comments
    )

    rating_dict = rating.model_dump()
    rating_dict["created_at"] = rating_dict["created_at"].isoformat()

    rating_ref = db.collection('ratings').document(rating.rating_id)
    await run_sync(rating_ref.set, rating_dict)

    # Update user scores
    await update_user_scores(rating_data.rated_user_id)
    
    # Continuous Re-calibration trigger
    if GEMINI_ENABLED:
        asyncio.create_task(trigger_recalibration_prompt(rating_data.rated_user_id))

    return rating_dict

@api_router.get("/ratings/{user_id}")
async def get_user_ratings(user_id: str):
    """Get all ratings for a user"""
    def _query():
        docs = db.collection('ratings').where('rated_user_id', '==', user_id).limit(100).get()
        return [d.to_dict() for d in docs]

    ratings = await run_sync(_query)
    return ratings

# ==================== AI HELPER FUNCTIONS ====================

async def generate_ikigai_statement(ikigai: IkigaiCreate, user_name: str) -> str:
    """Generate an Ikigai statement using Gemini"""
    if not GEMINI_ENABLED:
        return None

    prompt = f"""You are an expert in Ikigai philosophy. Generate a concise, inspiring Ikigai statement (2-3 sentences) based on the user's responses. Be specific and personal.

Based on {user_name}'s Ikigai responses, create a personal Ikigai statement:

What they LOVE: {', '.join(ikigai.what_i_love) or 'Not specified'}
What they're GOOD AT: {', '.join(ikigai.what_im_good_at) or 'Not specified'}
What they can be PAID FOR: {', '.join(ikigai.what_i_can_be_paid_for) or 'Not specified'}
What the WORLD NEEDS: {', '.join(ikigai.what_the_world_needs) or 'Not specified'}

Generate a 2-3 sentence Ikigai statement that captures the intersection of these elements."""

    response = await run_sync(
        gemini_client.models.generate_content,
        model="gemini-2.0-flash",
        contents=prompt
    )
    return response.text

async def ai_search_people(query: str, intent_filter: Optional[str], availability_filter: Optional[str]) -> List[dict]:
    """AI-powered search for people"""
    def _get_users():
        q = db.collection('users').where('onboarding_completed', '==', True).where('is_public', '==', True)
        if intent_filter:
            q = q.where('primary_intent', '==', intent_filter)
        if availability_filter:
            q = q.where('availability', '==', availability_filter)
        docs = q.limit(100).get()
        return [d.to_dict() for d in docs]

    users = await run_sync(_get_users)

    if not users:
        return []

    # Get ikigai for each user
    user_profiles = []
    for u in users:
        ikigai_ref = db.collection('ikigai_profiles').document(u["user_id"])
        ikigai_doc = await run_sync(ikigai_ref.get)
        u["ikigai"] = _doc_to_dict(ikigai_doc)
        user_profiles.append(u)

    if not GEMINI_ENABLED or not user_profiles:
        return user_profiles[:20]

    # Create profiles summary
    profiles_summary = []
    for u in user_profiles[:20]:  # Limit to 20 for context
        ikigai = u.get("ikigai", {}) or {}
        profiles_summary.append({
            "user_id": u["user_id"],
            "name": u["name"],
            "role_labels": u.get("role_labels", []),
            "primary_intent": u.get("primary_intent"),
            "availability": u.get("availability"),
            "what_i_love": ikigai.get("what_i_love", []),
            "what_im_good_at": ikigai.get("what_im_good_at", []),
            "peer_score": u.get("peer_score", 0)
        })

    prompt = f"""You are an expert at matching people based on their Ikigai profiles. Return JSON only.

Search query: "{query}"

Available profiles:
{profiles_summary}

Rank the top 10 most relevant profiles for this search. Return a JSON array with:
[{{"user_id": "...", "match_score": 0.0-1.0, "reasoning_summary": "..."}}]

Only return the JSON array, nothing else."""

    try:
        response = await run_sync(
            gemini_client.models.generate_content,
            model="gemini-2.0-flash",
            contents=prompt
        )
        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        rankings = json.loads(response_text)

        # Merge rankings with full user data
        ranked_users = []
        for rank in rankings:
            for u in user_profiles:
                if u["user_id"] == rank["user_id"]:
                    u["match_score"] = rank.get("match_score", 0.5)
                    u["match_reasoning"] = rank.get("reasoning_summary", "")
                    ranked_users.append(u)
                    break

        return ranked_users
    except Exception as e:
        logging.getLogger(__name__).error(f"AI ranking failed: {e}")
        return user_profiles[:20]

async def rank_candidates_for_opportunity(opp: dict, applications: List[dict]) -> List[dict]:
    """Rank candidates for an opportunity using AI"""
    if not applications:
        return []

    if not GEMINI_ENABLED:
        return applications

    # Get full profiles for applicants
    candidates = []
    for app in applications:
        user_ref = db.collection('users').document(app["applicant_id"])
        user_doc = await run_sync(user_ref.get)
        user_data = _doc_to_dict(user_doc)

        ikigai_ref = db.collection('ikigai_profiles').document(app["applicant_id"])
        ikigai_doc = await run_sync(ikigai_ref.get)
        ikigai_data = _doc_to_dict(ikigai_doc)

        if user_data:
            candidates.append({
                "application": app,
                "user": user_data,
                "ikigai": ikigai_data
            })

    prompt = f"""You are an expert at matching candidates to opportunities. Return JSON only.

Opportunity:
- Title: {opp['title']}
- Type: {opp['type']}
- Description: {opp['description']}
- Skills required: {opp.get('skills_required', [])}

Candidates:
{[{
    "applicant_id": c["application"]["applicant_id"],
    "name": c["user"]["name"],
    "skills": c.get("ikigai", {}).get("what_im_good_at", []) if c.get("ikigai") else [],
    "passions": c.get("ikigai", {}).get("what_i_love", []) if c.get("ikigai") else [],
    "peer_score": c["user"].get("peer_score", 0)
} for c in candidates]}

Rank all candidates by fit. Return JSON array:
[{{"applicant_id": "...", "match_score": 0.0-1.0, "reasoning_summary": "...", "highlighted_overlap": ["..."]}}]"""

    try:
        response = await run_sync(
            gemini_client.models.generate_content,
            model="gemini-2.0-flash",
            contents=prompt
        )

        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        rankings = json.loads(response_text)

        # Merge with applications
        ranked = []
        for rank in rankings:
            for c in candidates:
                if c["application"]["applicant_id"] == rank["applicant_id"]:
                    result = c["application"].copy()
                    result["user"] = c["user"]
                    result["ikigai"] = c["ikigai"]
                    result["match_score"] = rank.get("match_score", 0.5)
                    result["match_reasoning"] = rank.get("reasoning_summary", "")
                    result["highlighted_overlap"] = rank.get("highlighted_overlap", [])
                    ranked.append(result)
                    break

        return ranked
    except Exception as e:
        logging.getLogger(__name__).error(f"Candidate ranking failed: {e}")
        return applications

async def trigger_recalibration_prompt(user_id: str):
    """Trigger AI to evaluate recent ratings and suggest matching_preferences updates"""
    try:
        user_ref = db.collection('users').document(user_id)
        user_doc = await run_sync(user_ref.get)
        user_data = _doc_to_dict(user_doc)
        if not user_data:
            return
            
        def _get_recent_ratings():
            return [d.to_dict() for d in db.collection('ratings').where('rated_user_id', '==', user_id).order_by('created_at', direction=firestore.Query.DESCENDING).limit(3).get()]
            
        recent_ratings = await run_sync(_get_recent_ratings)
        if not recent_ratings:
            return
            
        prompt = f"""You are an expert career coach helping a user improve their networking profile.
Review this user's 3 most recent gig ratings and their current matching preferences. Wait to suggest exactly one actionable update to their matching preferences.

Current Preferences: {user_data.get('matching_preferences', {})}
Recent Ratings: {recent_ratings}

Return JSON:
{{
  "suggested_update": "Add 'Reliable' to skills",
  "rationale": "You scored 10/10 on reliability in your last 3 gigs.",
  "confidence": 0.95
}}
"""
        response = await run_sync(
            gemini_client.models.generate_content,
            model="gemini-2.0-flash",
            contents=prompt
        )
        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]
        suggestion = json.loads(response_text)
        
        prompt_data = {
            "prompt_id": f"prompt_{uuid.uuid4().hex[:12]}",
            "suggested_update": suggestion.get("suggested_update", ""),
            "rationale": suggestion.get("rationale", ""),
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await run_sync(user_ref.collection('recalibration_prompts').document(prompt_data["prompt_id"]).set, prompt_data)
        
    except Exception as e:
        logging.getLogger(__name__).error(f"Recalibration failed: {e}")

async def update_user_scores(user_id: str):
    """Update user's peer and recruiter scores based on ratings"""
    def _get_ratings():
        docs = db.collection('ratings').where('rated_user_id', '==', user_id).limit(100).get()
        return [d.to_dict() for d in docs]

    ratings = await run_sync(_get_ratings)

    if not ratings:
        return

    peer_ratings = [r for r in ratings if r["rater_type"] == "peer"]
    recruiter_ratings = [r for r in ratings if r["rater_type"] == "recruiter"]

    def calc_score(rating_list: List[dict], weights: dict) -> float:
        if not rating_list:
            return 0.0

        total = 0
        for r in rating_list:
            score = sum([
                r["collaboration"] * weights.get("collaboration", 1),
                r["reliability"] * weights.get("reliability", 1),
                r["skill_quality"] * weights.get("skill_quality", 1),
                r["culture_fit"] * weights.get("culture_fit", 1),
                r["professionalism"] * weights.get("professionalism", 1)
            ])
            total += score / sum(weights.values())

        return round(total / len(rating_list), 1)

    # Peer score weights: emphasize collaboration, culture fit, skill
    peer_score = calc_score(peer_ratings, {
        "collaboration": 1.5,
        "reliability": 1,
        "skill_quality": 1.5,
        "culture_fit": 1.5,
        "professionalism": 0.5
    })

    # Recruiter score weights: emphasize reliability, professionalism, skill
    recruiter_score = calc_score(recruiter_ratings, {
        "collaboration": 0.5,
        "reliability": 1.5,
        "skill_quality": 1.5,
        "culture_fit": 0.5,
        "professionalism": 1.5
    }) if recruiter_ratings else peer_score * 0.8

    user_ref = db.collection('users').document(user_id)
    await run_sync(user_ref.update, {"peer_score": peer_score, "recruiter_score": recruiter_score})

# ==================== BASIC ENDPOINTS ====================

@api_router.get("/")
async def root():
    return {"message": "SuperNetworkAI API", "version": "1.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
