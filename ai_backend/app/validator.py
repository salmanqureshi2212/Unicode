import json
import re
from app.schema import AIResponse

def extract_json(text: str):
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    return match.group()

def validate_response(raw_text: str):
    try:
        json_text = extract_json(raw_text)
        if json_text is None:
            return None

        data = json.loads(json_text)
        validated = AIResponse(**data)
        return validated.dict()
    except Exception:
        return None
