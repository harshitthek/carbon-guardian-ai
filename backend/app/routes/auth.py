from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.services.auth import get_password_hash, verify_password, create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
def signup(payload: SignupRequest, response: Response):
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    with get_db() as db:
        user = db.execute("SELECT id FROM users WHERE email = ?", (payload.email,)).fetchone()
        if user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        hashed = get_password_hash(payload.password)
        db.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (payload.name, payload.email, hashed)
        )
        new_user = db.execute("SELECT id FROM users WHERE email = ?", (payload.email,)).fetchone()
        
    access_token = create_access_token(subject=new_user["id"])
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
def login(payload: LoginRequest, response: Response):
    with get_db() as db:
        user = db.execute("SELECT * FROM users WHERE email = ?", (payload.email,)).fetchone()
    
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    access_token = create_access_token(subject=user["id"])
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
    response.delete_cookie("access_token", httponly=True, secure=True, samesite="lax")
    return {"status": "success"}

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "level": current_user["level"],
        "persona": current_user["persona"],
        "role": current_user["role"]
    }
