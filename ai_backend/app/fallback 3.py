def fallback_response():
    return {
        "damage_class": "unknown",
        "severity": "medium",
        "severity_score": 0.5,
        "health_score": 50,
        "risk_level": "Warning",
        "ai_suggestion": "Damage could not be clearly identified. Manual inspection recommended.",
        "inferred_infra_type": None,
        "infra_type_mismatch": False
    }
