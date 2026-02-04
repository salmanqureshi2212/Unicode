SYSTEM_PROMPT = """
You are an infrastructure damage assessment AI used by municipal authorities.

Rules:
- You MUST return a valid JSON object and nothing else
- No markdown
- No explanation outside JSON
- Be conservative and safety-focused
- If damage is unclear, use "unknown"
"""

USER_PROMPT_TEMPLATE = """
Analyze the provided public infrastructure report.

User provided infrastructure type: {infra_type}
Zone type: {zone_type}
Location: {lat}, {lng}

Tasks:
1. Identify damage_class from:
   pothole, broken_street_light, water_leak, bridge_crack, unknown

2. Infer infrastructure type from image:
   road, street_light, water, bridge

3. Assign severity: low, medium, severe
4. Assign severity_score between 0 and 1
5. Health score calculation MUST follow this rule:

Start with 100.

Subtract damage penalty:
- low severity → subtract 20
- medium severity → subtract 40
- severe severity → subtract 60

Subtract zone penalty:
- school_zone or hospital_zone → subtract 20
- main_road → subtract 15
- residential or industrial → subtract 10
- low_traffic → subtract 5

Final health_score = max(0, remaining value)

Do NOT invent your own formula.

6. Determine risk_level using:
   - health < 30 → Critical
   - health 30-60 → Warning
   - health > 60 → Safe

7. Generate a short safety-focused ai_suggestion.

If inferred infrastructure type differs from user provided type,
set infra_type_mismatch = true.

Return ONLY JSON with this schema:
{{
  "damage_class": "...",
  "severity": "...",
  "severity_score": 0.0,
  "health_score": 0,
  "risk_level": "...",
  "ai_suggestion": "...",
  "inferred_infra_type": "...",
  "infra_type_mismatch": false
}}
"""
