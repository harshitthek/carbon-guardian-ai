from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import get_password_hash, verify_password, create_access_token
from app.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    """Payload for user signup request."""
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    """Payload for user login request."""
    email: EmailStr
    password: str

@router.post("/signup")
def signup(payload: SignupRequest, response: Response, db: Session = Depends(get_db)):
    """Register a new user and return an access token via cookie."""
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed = get_password_hash(payload.password)
    new_user = User(name=payload.name, email=payload.email, password_hash=hashed)
    db.add(new_user)
    from sqlalchemy.exc import IntegrityError
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
        
    access_token = create_access_token(subject=new_user.id)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
    )
    return {"status": "success"}

@router.post("/login")
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    """Authenticate a user and return an access token via cookie."""
    user = db.query(User).filter(User.email == payload.email).first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = create_access_token(subject=user.id)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        max_age=7 * 24 * 60 * 60,
        samesite="lax",
    )
    return {"status": "success"}

@router.post("/logout")
def logout(response: Response):
    """Log the user out by clearing their access token cookie."""
    response.delete_cookie("access_token", httponly=True, secure=True, samesite="lax")
    return {"status": "success"}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's details."""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "level": current_user.level,
        "persona": current_user.persona,
        "role": current_user.role
    }
