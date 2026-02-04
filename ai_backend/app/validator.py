import json
from app.schema import AIResponse

def validate_response(raw_text: str):
    try:
        data = json.loads(raw_text)
        validated = AIResponse(**data)
        return validated.dict()
    except Exception:
        return None
