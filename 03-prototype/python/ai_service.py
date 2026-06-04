"""Optional OpenAI lookup for Streamlit."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path
from typing import Any

import streamlit as st

_ENV_LOADED = False


def _load_env_file() -> None:
    global _ENV_LOADED
    if _ENV_LOADED:
        return
    _ENV_LOADED = True
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.is_file():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val


def _get_secret(key: str, default: str = "") -> str:
    _load_env_file()
    try:
        return str(st.secrets[key]).strip()
    except Exception:
        pass
    return os.environ.get(key, default).strip()


def get_openai_key() -> str:
    return _get_secret("OPENAI_API_KEY")


def has_openai() -> bool:
    return bool(get_openai_key())


def get_openai_model() -> str:
    return _get_secret("OPENAI_MODEL", "gpt-4o-mini")


def ai_lookup(drug_query: str, condition: str, patient: dict) -> dict | None:
    key = get_openai_key()
    if not key:
        return None
    try:
        from openai import OpenAI
    except ImportError:
        return None

    client = OpenAI(api_key=key)
    prompt = f"""Tra cứu thuốc an toàn (JSON only):
Thuốc: {drug_query}
Tình trạng: {condition}
Tuổi: {patient.get('age')} Giới: {patient.get('gender')}

Trả JSON:
{{"drugName":"","activeIngredient":"","indications":"","warnings":[],"contraindications":[],"safetyLevel":"green|yellow|red","safetySummary":""}}
Chỉ JSON, tiếng Việt, thông tin tham khảo."""

    model = get_openai_model()

    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    text = resp.choices[0].message.content or ""
    m = re.search(r"\{[\s\S]*\}", text)
    if not m:
        return None
    data = json.loads(m.group())
    card = {
        "drugName": data.get("drugName") or drug_query,
        "activeIngredient": data.get("activeIngredient") or "—",
        "condition": condition,
        "indications": data.get("indications") or "",
        "warnings": data.get("warnings") or [],
        "contraindications": data.get("contraindications") or [],
        "safetyLevel": data.get("safetyLevel") or "yellow",
        "safetySummary": data.get("safetySummary") or "Thông tin AI — cần xác nhận dược sĩ.",
        "matchedRules": [],
        "source": "OpenAI (tham khảo)",
        "sources": [{"title": "OpenAI lookup", "link": None, "snippet": ""}],
    }
    return {"status": "ok", "mode": "openai", "card": card, "drug": None, "normalizedQuery": card["drugName"]}
