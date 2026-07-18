from fastapi import Request, HTTPException, status, Depends
import jwt
from sqlalchemy.orm import Session
from app.services.auth import SECRET_KEY, ALGORITHM
from app.database import get_db
from app.models import User

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Retrieve the current authenticated user from the request cookies."""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None or not str(user_id_str).isdigit():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        user_id = int(user_id_str)
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
