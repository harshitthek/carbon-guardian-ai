"""admin.py module."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
import io
from fastapi.responses import StreamingResponse

from app.database import get_db
from app.dependencies import get_current_admin_user
from app.services.seeder import seed_database
from app.models import User, UserActivity, EmissionsLog, Recommendation, Reward, CommunityGroup, AdminAuditLog, GamificationSetting
import csv

router = APIRouter(prefix="/admin", tags=["admin"])

def log_audit(db: Session, admin_id: int, action: str, target_resource: str, target_id: Optional[str] = None, details: Optional[str] = None):
    """
    Log an administrative action to the audit log table.
    """
    log = AdminAuditLog(admin_id=admin_id, action=action, target_resource=target_resource, target_id=target_id, details=details)
    db.add(log)
    db.flush()

class ORMBaseModel(BaseModel):
    model_config = {"from_attributes": True}

class SystemStatsOut(BaseModel):
    """Payload returning overall system statistics for the admin dashboard."""
    total_users: int
    total_activities: int
    total_emissions_logs: int
    total_green_points: int
    total_recommendations: int
    active_groups: int

class UserItem(BaseModel):
    """Detailed summary of an individual user."""
    id: int
    name: str
    email: str
    role: str
    level: int
    persona: str
    green_points: int

class UsersPaginatedOut(BaseModel):
    """Paginated list of users."""
    items: List[UserItem]
    total: int
    page: int
    pages: int

class UserUpdateIn(BaseModel):
    """Payload for updating a user's details."""
    role: Optional[str] = None
    level: Optional[int] = None
    persona: Optional[str] = None
    green_points: Optional[int] = None

class GroupItem(ORMBaseModel):
    """Detailed summary of a community group."""
    id: int
    name: str
    weekly_reduction_kg: float
    rank: int
    members: int

class GroupUpdateIn(BaseModel):
    """Payload for updating a community group's details."""
    name: Optional[str] = None
    weekly_reduction_kg: Optional[float] = None
    rank: Optional[int] = None
    members: Optional[int] = None

@router.get("/stats", response_model=SystemStatsOut, summary="Get System Stats")
def get_stats(admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Fetch global statistics across the platform."""
    users = db.query(User).count()
    activities = db.query(UserActivity).count()
    emissions = db.query(EmissionsLog).count()
    points = db.query(func.sum(User.green_points)).scalar() or 0
    recs = db.query(Recommendation).count()
    groups = db.query(CommunityGroup).count()
    return {
        "total_users": users,
        "total_activities": activities,
        "total_emissions_logs": emissions,
        "total_green_points": int(points),
        "total_recommendations": recs,
        "active_groups": groups
    }

@router.get("/users", response_model=UsersPaginatedOut, summary="List Users")
def list_users(page: int = 1, limit: int = 50, search: str = "", admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """List and optionally search across all users in a paginated format."""
    if page < 1 or limit < 1:
        raise HTTPException(status_code=400, detail="Invalid pagination parameters")
    query = db.query(User)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%") | User.name.ilike(f"%{search}%"))
    total = query.count()
    pages = (total + limit - 1) // limit if total > 0 else 1
    items = query.offset((page - 1) * limit).limit(limit).all()
    return {
        "items": [{"id": i.id, "name": i.name, "email": i.email, "role": i.role, "level": i.level, "persona": i.persona, "green_points": i.green_points} for i in items],
        "total": total,
        "page": page,
        "pages": pages
    }

@router.put("/users/{user_id}", response_model=UserItem, summary="Update User")
def update_user(user_id: int, payload: UserUpdateIn, admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Update a specific user's attributes (e.g., role, green points)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if payload.role is not None:
        user.role = payload.role
    if payload.level is not None:
        user.level = payload.level
    if payload.persona is not None:
        user.persona = payload.persona
    if payload.green_points is not None:
        user.green_points = payload.green_points
    
    log_audit(db, admin.id, "update", "User", str(user.id), "Updated fields")
    db.commit()
    db.refresh(user)
    return {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "level": user.level, "persona": user.persona, "green_points": user.green_points}

@router.get("/groups", response_model=List[GroupItem], summary="List Groups")
def list_groups(admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """List all community groups ordered by rank."""
    return db.query(CommunityGroup).order_by(CommunityGroup.rank.asc()).all()

@router.put("/groups/{group_id}", response_model=GroupItem, summary="Update Group")
def update_group(group_id: int, payload: GroupUpdateIn, admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Update attributes for a specific community group."""
    group = db.query(CommunityGroup).filter(CommunityGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    if payload.name is not None: group.name = payload.name
    if payload.weekly_reduction_kg is not None: group.weekly_reduction_kg = payload.weekly_reduction_kg
    if payload.rank is not None: group.rank = payload.rank
    if payload.members is not None: group.members = payload.members
    log_audit(db, admin.id, "update", "CommunityGroup", str(group.id))
    db.commit()
    db.refresh(group)
    return group

def generate_csv(logs):
    """Generator function that yields chunks of CSV data for emissions logs."""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "user_id", "transport_kg", "electricity_kg", "waste_kg", "total_kg", "created_at"])
    yield output.getvalue()
    output.truncate(0)
    output.seek(0)
    for log in logs:
        writer.writerow([log.id, log.user_id, log.transport_kg, log.electricity_kg, log.waste_kg, log.total_kg, log.created_at])
        yield output.getvalue()
        output.truncate(0)
        output.seek(0)

@router.get("/export/emissions", summary="Export Emissions Logs")
def export_emissions(admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Stream all emission logs in CSV format."""
    log_audit(db, admin.id, "export", "EmissionsLog")
    db.commit()
    logs = db.query(EmissionsLog).yield_per(1000)
    return StreamingResponse(generate_csv(logs), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=emissions.csv"})

class AuditLogItem(ORMBaseModel):
    """Schema for individual audit log records."""
    id: int
    admin_id: int
    action: str
    target_resource: str
    target_id: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

@router.get("/audit-logs", response_model=List[AuditLogItem], summary="Get Audit Logs")
def get_audit_logs(admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Fetch the most recent 100 administrative audit logs."""
    logs = db.query(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()).limit(100).all()
    return logs

@router.delete("/logs/purge", summary="Purge Old Logs")
def purge_logs(admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Delete activities and emission logs older than 30 days to free up space."""
    cutoff = datetime.utcnow() - timedelta(days=30)
    del_act = db.query(UserActivity).filter(UserActivity.created_at < cutoff).delete()
    del_emi = db.query(EmissionsLog).filter(EmissionsLog.created_at < cutoff).delete()
    log_audit(db, admin.id, "delete", "Logs", details=f"Purged {del_act} activities, {del_emi} emissions")
    db.commit()
    return {"status": "success", "purged_activities": del_act, "purged_emissions": del_emi}

@router.post("/system/seed", summary="Seed Database")
def trigger_system_seed(
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
):
    """Seed the database with initial testing data. Requires admin privileges."""
    success = seed_database(db)
    if success:
        log_audit(db, admin.id, "execute", "System", details="Seeded database")
        db.commit()
        return {"status": "success", "message": "Database seeded with dummy data"}
    else:
        return {"status": "skipped", "message": "Database already contains data"}

class GamificationSettingItem(ORMBaseModel):
    """Payload representing a single gamification setting."""
    id: int
    action_name: str
    points: int

class GamificationSettingUpdateIn(BaseModel):
    """Payload to update gamification points for a given action."""
    points: int

@router.get("/settings/gamification", response_model=List[GamificationSettingItem], summary="Get Gamification Settings")
def get_gamification_settings(admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Retrieve all current gamification rules and their point values."""
    return db.query(GamificationSetting).order_by(GamificationSetting.action_name).all()

@router.put("/settings/gamification/{setting_id}", response_model=GamificationSettingItem, summary="Update Gamification Setting")
def update_gamification_setting(setting_id: int, payload: GamificationSettingUpdateIn, admin: User = Depends(get_current_admin_user), db: Session = Depends(get_db)):
    """Update the point value for a specific gamification setting."""
    setting = db.query(GamificationSetting).filter(GamificationSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    setting.points = payload.points
    log_audit(db, admin.id, "update", "GamificationSetting", str(setting.id), f"Updated points to {payload.points}")
    db.commit()
    db.refresh(setting)
    
    return setting


