from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Emergent LLM Key for Gemini
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

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

# ==================== MODELS ====================

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
    
    # Find session
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user_doc)

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Call Emergent Auth to get user data
    async with httpx.AsyncClient() as client_http:
        auth_response = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        
        if auth_response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        
        auth_data = auth_response.json()
    
    email = auth_data.get("email")
    name = auth_data.get("name")
    picture = auth_data.get("picture")
    session_token = auth_data.get("session_token")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": email}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        # Update user info if needed
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}}
        )
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
        await db.users.insert_one(new_user)
    
    # Store session
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
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
    
    # Get full user data
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    return {"user": user_doc}

@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    """Get current user data"""
    # Also get ikigai profile
    ikigai = await db.ikigai_profiles.find_one({"user_id": user.user_id}, {"_id": 0})
    
    user_dict = user.model_dump()
    user_dict["ikigai"] = ikigai
    
    return user_dict

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    
    return {"message": "Logged out"}

# ==================== USER ENDPOINTS ====================

@api_router.get("/users/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get public user profile"""
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get ikigai
    ikigai = await db.ikigai_profiles.find_one({"user_id": user_id}, {"_id": 0})
    
    # Get ratings
    ratings = await db.ratings.find({"rated_user_id": user_id}, {"_id": 0}).to_list(100)
    
    return {
        "user": user_doc,
        "ikigai": ikigai,
        "ratings": ratings
    }

@api_router.put("/users/profile")
async def update_profile(updates: UserUpdate, user: User = Depends(get_current_user)):
    """Update user profile"""
    update_dict = {k: v for k, v in updates.model_dump().items() if v is not None}
    
    if update_dict:
        await db.users.update_one(
            {"user_id": user.user_id},
            {"$set": update_dict}
        )
    
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return user_doc

@api_router.get("/users/leaderboard")
async def get_leaderboard(view: str = "peer", limit: int = 20):
    """Get leaderboard by peer or recruiter score"""
    sort_field = "peer_score" if view == "peer" else "recruiter_score"
    
    users = await db.users.find(
        {"onboarding_completed": True},
        {"_id": 0}
    ).sort(sort_field, -1).limit(limit).to_list(limit)
    
    # Add rank
    for i, u in enumerate(users):
        u["rank"] = i + 1
    
    return users

# ==================== IKIGAI ENDPOINTS ====================

@api_router.post("/ikigai")
async def create_or_update_ikigai(ikigai_data: IkigaiCreate, user: User = Depends(get_current_user)):
    """Create or update Ikigai profile"""
    existing = await db.ikigai_profiles.find_one({"user_id": user.user_id}, {"_id": 0})
    
    now = datetime.now(timezone.utc)
    
    if existing:
        # Update
        update_dict = ikigai_data.model_dump()
        update_dict["updated_at"] = now.isoformat()
        
        await db.ikigai_profiles.update_one(
            {"user_id": user.user_id},
            {"$set": update_dict}
        )
    else:
        # Create
        ikigai_doc = {
            "ikigai_id": f"ikigai_{uuid.uuid4().hex[:12]}",
            "user_id": user.user_id,
            **ikigai_data.model_dump(),
            "ikigai_statement": None,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        await db.ikigai_profiles.insert_one(ikigai_doc)
    
    # Mark onboarding complete
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"onboarding_completed": True}}
    )
    
    # Generate Ikigai statement with AI
    try:
        ikigai_statement = await generate_ikigai_statement(ikigai_data, user.name)
        await db.ikigai_profiles.update_one(
            {"user_id": user.user_id},
            {"$set": {"ikigai_statement": ikigai_statement}}
        )
    except Exception as e:
        logger.error(f"Failed to generate Ikigai statement: {e}")
    
    ikigai = await db.ikigai_profiles.find_one({"user_id": user.user_id}, {"_id": 0})
    return ikigai

@api_router.get("/ikigai")
async def get_my_ikigai(user: User = Depends(get_current_user)):
    """Get current user's Ikigai profile"""
    ikigai = await db.ikigai_profiles.find_one({"user_id": user.user_id}, {"_id": 0})
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
    
    # Insert and get back without _id
    await db.opportunities.insert_one(opp_dict.copy())
    
    # Return clean dict (without _id that MongoDB adds)
    return {k: v for k, v in opp_dict.items() if k != "_id"}

@api_router.get("/opportunities")
async def list_opportunities(
    type_filter: Optional[str] = None,
    status: str = "open",
    limit: int = 20,
    skip: int = 0
):
    """List opportunities with filters"""
    query = {"status": status}
    if type_filter:
        query["type"] = type_filter
    
    opportunities = await db.opportunities.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return opportunities

@api_router.get("/opportunities/{opportunity_id}")
async def get_opportunity(opportunity_id: str):
    """Get single opportunity"""
    opp = await db.opportunities.find_one({"opportunity_id": opportunity_id}, {"_id": 0})
    
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Get creator's ikigai
    creator_ikigai = await db.ikigai_profiles.find_one(
        {"user_id": opp["creator_id"]},
        {"_id": 0}
    )
    
    opp["creator_ikigai"] = creator_ikigai
    
    return opp

@api_router.get("/opportunities/{opportunity_id}/candidates")
async def get_opportunity_candidates(opportunity_id: str, user: User = Depends(get_current_user)):
    """Get ranked candidates for an opportunity"""
    opp = await db.opportunities.find_one({"opportunity_id": opportunity_id}, {"_id": 0})
    
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    if opp["creator_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get applications
    applications = await db.applications.find(
        {"opportunity_id": opportunity_id},
        {"_id": 0}
    ).to_list(100)
    
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
    opp = await db.opportunities.find_one({"opportunity_id": opportunity_id}, {"_id": 0})
    
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    
    # Check if already applied
    existing = await db.applications.find_one({
        "opportunity_id": opportunity_id,
        "applicant_id": user.user_id
    })
    
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
    
    await db.applications.insert_one(app_dict)
    
    # Update applications count
    await db.opportunities.update_one(
        {"opportunity_id": opportunity_id},
        {"$inc": {"applications_count": 1}}
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
        query = {"onboarding_completed": True}
        if search.intent_filter:
            query["primary_intent"] = search.intent_filter
        if search.availability_filter:
            query["availability"] = search.availability_filter
        
        users = await db.users.find(query, {"_id": 0}).limit(20).to_list(20)
        
        # Add ikigai to each user
        for u in users:
            ikigai = await db.ikigai_profiles.find_one({"user_id": u["user_id"]}, {"_id": 0})
            u["ikigai"] = ikigai
            u["match_score"] = 0.5
            u["match_reasoning"] = "Based on profile match"
        
        return users

# ==================== MESSAGING ENDPOINTS ====================

@api_router.post("/messages")
async def send_message(msg_data: MessageCreate, user: User = Depends(get_current_user)):
    """Send a message"""
    receiver = await db.users.find_one({"user_id": msg_data.receiver_id}, {"_id": 0})
    
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
    
    # Find or create conversation
    participants = sorted([user.user_id, msg_data.receiver_id])
    conv = await db.conversations.find_one({"participants": participants}, {"_id": 0})
    
    if not conv:
        conv = Conversation(
            participants=participants,
            participant_names={user.user_id: user.name, msg_data.receiver_id: receiver["name"]},
            participant_pictures={user.user_id: user.picture or "", msg_data.receiver_id: receiver.get("picture", "")},
            unread_count={user.user_id: 0, msg_data.receiver_id: 0}
        )
        conv_dict = conv.model_dump()
        conv_dict["created_at"] = conv_dict["created_at"].isoformat()
        conv_dict["last_message_at"] = None
        await db.conversations.insert_one(conv_dict)
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
    
    await db.messages.insert_one(msg_dict)
    
    # Update conversation
    await db.conversations.update_one(
        {"conversation_id": conv["conversation_id"]},
        {
            "$set": {
                "last_message": msg_data.content[:100],
                "last_message_at": datetime.now(timezone.utc).isoformat()
            },
            "$inc": {f"unread_count.{msg_data.receiver_id}": 1}
        }
    )
    
    return msg_dict

@api_router.get("/messages/conversations")
async def get_conversations(user: User = Depends(get_current_user)):
    """Get user's conversations"""
    conversations = await db.conversations.find(
        {"participants": user.user_id},
        {"_id": 0}
    ).sort("last_message_at", -1).to_list(50)
    
    return conversations

@api_router.get("/messages/{conversation_id}")
async def get_messages(conversation_id: str, user: User = Depends(get_current_user)):
    """Get messages in a conversation"""
    conv = await db.conversations.find_one({"conversation_id": conversation_id}, {"_id": 0})
    
    if not conv or user.user_id not in conv["participants"]:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Mark as read
    await db.conversations.update_one(
        {"conversation_id": conversation_id},
        {"$set": {f"unread_count.{user.user_id}": 0}}
    )
    
    messages = await db.messages.find(
        {"conversation_id": conversation_id},
        {"_id": 0}
    ).sort("created_at", 1).to_list(100)
    
    return {"conversation": conv, "messages": messages}

# ==================== RATING ENDPOINTS ====================

@api_router.post("/ratings")
async def create_rating(rating_data: RatingCreate, user: User = Depends(get_current_user)):
    """Create a rating for another user"""
    if rating_data.rated_user_id == user.user_id:
        raise HTTPException(status_code=400, detail="Cannot rate yourself")
    
    rated_user = await db.users.find_one({"user_id": rating_data.rated_user_id}, {"_id": 0})
    
    if not rated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Determine rater type (simplified: if user has recruiter in role_labels)
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
    
    await db.ratings.insert_one(rating_dict)
    
    # Update user scores
    await update_user_scores(rating_data.rated_user_id)
    
    return rating_dict

@api_router.get("/ratings/{user_id}")
async def get_user_ratings(user_id: str):
    """Get all ratings for a user"""
    ratings = await db.ratings.find({"rated_user_id": user_id}, {"_id": 0}).to_list(100)
    return ratings

# ==================== AI HELPER FUNCTIONS ====================

async def generate_ikigai_statement(ikigai: IkigaiCreate, user_name: str) -> str:
    """Generate an Ikigai statement using Gemini"""
    if not EMERGENT_LLM_KEY:
        return None
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"ikigai_{uuid.uuid4().hex[:8]}",
        system_message="You are an expert in Ikigai philosophy. Generate a concise, inspiring Ikigai statement (2-3 sentences) based on the user's responses. Be specific and personal."
    ).with_model("gemini", "gemini-3-flash-preview")
    
    prompt = f"""
Based on {user_name}'s Ikigai responses, create a personal Ikigai statement:

What they LOVE: {', '.join(ikigai.what_i_love) or 'Not specified'}
What they're GOOD AT: {', '.join(ikigai.what_im_good_at) or 'Not specified'}
What they can be PAID FOR: {', '.join(ikigai.what_i_can_be_paid_for) or 'Not specified'}
What the WORLD NEEDS: {', '.join(ikigai.what_the_world_needs) or 'Not specified'}

Generate a 2-3 sentence Ikigai statement that captures the intersection of these elements.
"""
    
    response = await chat.send_message(UserMessage(text=prompt))
    return response

async def ai_search_people(query: str, intent_filter: Optional[str], availability_filter: Optional[str]) -> List[dict]:
    """AI-powered search for people"""
    # Get all users with ikigai
    base_query = {"onboarding_completed": True}
    if intent_filter:
        base_query["primary_intent"] = intent_filter
    if availability_filter:
        base_query["availability"] = availability_filter
    
    users = await db.users.find(base_query, {"_id": 0}).to_list(100)
    
    if not users:
        return []
    
    # Get ikigai for each user
    user_profiles = []
    for u in users:
        ikigai = await db.ikigai_profiles.find_one({"user_id": u["user_id"]}, {"_id": 0})
        u["ikigai"] = ikigai
        user_profiles.append(u)
    
    if not EMERGENT_LLM_KEY or not user_profiles:
        return user_profiles[:20]
    
    # Use AI to rank
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"search_{uuid.uuid4().hex[:8]}",
        system_message="You are an expert at matching people based on their Ikigai profiles. Return JSON only."
    ).with_model("gemini", "gemini-3-flash-preview")
    
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
    
    prompt = f"""
Search query: "{query}"

Available profiles:
{profiles_summary}

Rank the top 10 most relevant profiles for this search. Return a JSON array with:
[{{"user_id": "...", "match_score": 0.0-1.0, "reasoning_summary": "..."}}]

Only return the JSON array, nothing else.
"""
    
    try:
        response = await chat.send_message(UserMessage(text=prompt))
        import json
        
        # Extract JSON from response
        response_text = response.strip()
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
        logger.error(f"AI ranking failed: {e}")
        return user_profiles[:20]

async def rank_candidates_for_opportunity(opp: dict, applications: List[dict]) -> List[dict]:
    """Rank candidates for an opportunity using AI"""
    if not applications:
        return []
    
    if not EMERGENT_LLM_KEY:
        return applications
    
    # Get full profiles for applicants
    candidates = []
    for app in applications:
        user = await db.users.find_one({"user_id": app["applicant_id"]}, {"_id": 0})
        ikigai = await db.ikigai_profiles.find_one({"user_id": app["applicant_id"]}, {"_id": 0})
        if user:
            candidates.append({
                "application": app,
                "user": user,
                "ikigai": ikigai
            })
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"rank_{uuid.uuid4().hex[:8]}",
        system_message="You are an expert at matching candidates to opportunities. Return JSON only."
    ).with_model("gemini", "gemini-3-flash-preview")
    
    prompt = f"""
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
[{{"applicant_id": "...", "match_score": 0.0-1.0, "reasoning_summary": "...", "highlighted_overlap": ["..."]}}]
"""
    
    try:
        response = await chat.send_message(UserMessage(text=prompt))
        import json
        
        response_text = response.strip()
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
        logger.error(f"Candidate ranking failed: {e}")
        return applications

async def update_user_scores(user_id: str):
    """Update user's peer and recruiter scores based on ratings"""
    ratings = await db.ratings.find({"rated_user_id": user_id}, {"_id": 0}).to_list(100)
    
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
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"peer_score": peer_score, "recruiter_score": recruiter_score}}
    )

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
