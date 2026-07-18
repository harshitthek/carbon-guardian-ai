from fastapi import APIRouter

router = APIRouter(prefix="/marketplace", tags=["marketplace"])

@router.get("")
def get_marketplace_items():
    """Returns available marketplace items and rewards."""
    return [
        { "id": 1, "title": "Tree Plantation Drive", "category": "Volunteer", "points": 200, "icon": "🌳" },
        { "id": 2, "title": "Solar Fund Donation", "category": "Donate", "points": 500, "icon": "☀️" },
        { "id": 3, "title": "Weekend Beach Cleanup", "category": "Action", "points": 300, "icon": "🏖️" },
        { "id": 4, "title": "Composting Workshop", "category": "Learn", "points": 100, "icon": "🍂" },
    ]
