"""Drug safety engine — Python port for Streamlit."""

from __future__ import annotations

import json
import re
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any, Literal

SafetyLevel = Literal["green", "yellow", "red"]
Gender = Literal["male", "female"]

_DB: dict | None = None
_DB_PATH = Path(__file__).resolve().parent.parent / "data" / "drugs-demo.json"


def normalize_text(raw: str) -> str:
    t = unicodedata.normalize("NFD", str(raw or "").lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return t.strip()


def load_db() -> dict:
    global _DB
    if _DB is None:
        with open(_DB_PATH, encoding="utf-8") as f:
            _DB = json.load(f)
    return _DB


def parse_age(raw: Any) -> int | None:
    m = re.search(r"\d+", str(raw or ""))
    if not m:
        return None
    age = int(m.group())
    return age if 0 <= age <= 120 else None


def parse_gender(raw: Any) -> Gender | None:
    t = normalize_text(str(raw or ""))
    if t in {"nam", "male", "boy", "dan ong"}:
        return "male"
    if t in {"nu", "nữ", "female", "girl", "dan ba"}:
        return "female"
    return None


def extract_patient(text: str) -> tuple[int | None, Gender | None]:
    t = text.strip()
    age = None
    gender = None

    age_match = (
        re.search(r"(\d{1,3})\s*(?:tuổi|tuoi)", t, re.I)
        or re.search(r"(\d{1,3})\s*t(?=[\s,;·]|$)", t, re.I)
        or re.search(r"^(\d{1,3})(?:\s*[,;·]|\s+(?:nữ|nu|nam)\b)", t, re.I)
    )
    if age_match:
        age = parse_age(age_match.group(1))

    for chunk in [t, *[p.strip() for p in re.split(r"[,;·]", t) if p.strip()]]:
        g = parse_gender(chunk)
        if g:
            gender = g

    n = normalize_text(t)
    if not gender:
        if re.search(r"(^|[\s,;])nu($|[\s,;])|nữ|female|phu nu|dan ba", n):
            gender = "female"
        elif re.search(r"(^|[\s,;])nam($|[\s,;])|male|dan ong", n) and "nam dinh" not in n:
            gender = "male"

    return age, gender


def _ratio(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()


def _label_matches(label: str, query: str) -> bool:
    n, q = normalize_text(label), normalize_text(query)
    if not q:
        return False
    if n == q:
        return True
    if _ratio(q, n) >= 0.78:
        return True
    if len(q) >= 3 and n.startswith(q):
        return True
    if len(q) >= 4 and q in n:
        return True
    return False


def find_drug_candidates(db: dict, query: str) -> list[dict]:
    q = normalize_text(query)
    if not q:
        return []
    seen: set[str] = set()
    out: list[dict] = []
    for drug in db["drugs"]:
        labels = [drug["name"], drug["activeIngredient"], *(drug.get("aliases") or [])]
        if any(_label_matches(lbl, q) for lbl in labels):
            if drug["id"] not in seen:
                seen.add(drug["id"])
                out.append(drug)
    return out


def is_exact_drug(db: dict, query: str) -> bool:
    q = normalize_text(query)
    if not q:
        return False
    for d in db["drugs"]:
        if normalize_text(d["name"]) == q or normalize_text(d["activeIngredient"]) == q:
            return True
        if any(normalize_text(a) == q for a in d.get("aliases") or []):
            return True
    return False


def resolve_exact_drug(db: dict, query: str, drug_id: str | None = None) -> dict | None:
    if drug_id:
        return next((d for d in db["drugs"] if d["id"] == drug_id), None)
    if not is_exact_drug(db, query):
        return None
    cands = [
        d
        for d in find_drug_candidates(db, query)
        if normalize_text(d["name"]) == normalize_text(query)
        or normalize_text(d["activeIngredient"]) == normalize_text(query)
        or any(normalize_text(a) == normalize_text(query) for a in d.get("aliases") or [])
    ]
    return cands[0] if cands else None


def detect_urgent(db: dict, condition: str) -> bool:
    n = normalize_text(condition)
    return any(normalize_text(kw) in n for kw in db.get("urgentKeywords") or [])


def evaluate_safety(
    drug: dict, condition: str, patient: dict | None = None
) -> dict[str, Any]:
    patient = patient or {}
    age = patient.get("age")
    gender = patient.get("gender")
    n = normalize_text(condition)
    hits: list[dict] = []

    for rule in drug.get("conditionRules") or []:
        if any(normalize_text(m) in n for m in rule.get("match") or []):
            hits.append({"level": rule["level"], "note": rule["note"]})

    for ci in drug.get("contraindications") or []:
        parts = normalize_text(ci).split()
        if any(len(p) > 3 and p in n for p in parts):
            hits.append({"level": "red", "note": f"Liên quan chống chỉ định: {ci}"})

    if age is not None:
        for rule in drug.get("ageRules") or []:
            if rule.get("minAge") is not None and age < rule["minAge"]:
                continue
            if rule.get("maxAge") is not None and age > rule["maxAge"]:
                continue
            hits.append({"level": rule["level"], "note": rule["note"]})

    if gender and age is not None:
        for rule in drug.get("genderRules") or []:
            if rule.get("gender") != gender:
                continue
            if rule.get("minAge") is not None and age < rule["minAge"]:
                continue
            if rule.get("maxAge") is not None and age > rule["maxAge"]:
                continue
            hits.append({"level": rule["level"], "note": rule["note"]})

    if not hits:
        return {
            "level": "yellow",
            "summary": "Chưa đủ dữ liệu demo — nên hỏi dược sĩ Long Châu.",
            "matchedRules": [],
        }

    order = {"red": 3, "yellow": 2, "green": 1}
    hits.sort(key=lambda h: order.get(h["level"], 0), reverse=True)
    top = hits[0]
    labels = {
        "green": "An toàn có điều kiện",
        "yellow": "Thận trọng — nên hỏi dược sĩ",
        "red": "Không nên tự ý — cần chuyên môn / cấp cứu",
    }
    return {"level": top["level"], "summary": labels.get(top["level"], labels["yellow"]), "matchedRules": hits}


def build_safety_card(drug: dict, condition: str, evaluation: dict, patient: dict | None = None) -> dict:
    patient = patient or {}
    return {
        "drugName": drug["name"],
        "activeIngredient": drug["activeIngredient"],
        "condition": condition,
        "age": patient.get("age"),
        "gender": patient.get("gender"),
        "indications": drug.get("indications", ""),
        "contraindications": drug.get("contraindications") or [],
        "warnings": drug.get("warnings") or [],
        "safetyLevel": evaluation["level"],
        "safetySummary": evaluation["summary"],
        "matchedRules": evaluation.get("matchedRules") or [],
        "source": drug.get("source", "Demo DB"),
        "sources": [{"title": drug.get("source", "Demo DB"), "link": None, "snippet": "DB nội bộ Long Châu (demo)"}],
    }


def suggest_drug_names(db: dict, query: str, limit: int = 5) -> list[dict]:
    q = query.strip()
    if not q:
        return []
    seen: set[str] = set()
    out: list[dict] = []
    for drug in find_drug_candidates(db, q):
        if drug["id"] in seen:
            continue
        seen.add(drug["id"])
        out.append({"drug": drug, "name": drug["name"], "reason": "Khớp / gần giống trong DB"})
        if len(out) >= limit:
            break
    return out


def suggest_drugs_for_condition(db: dict, condition: str) -> list[dict]:
    n = normalize_text(condition)
    hits: list[dict] = []
    for drug in db["drugs"]:
        for rule in drug.get("conditionRules") or []:
            if any(normalize_text(m) in n for m in rule.get("match") or []):
                score = {"green": 3, "yellow": 2, "red": 1}.get(rule["level"], 1)
                hits.append({"drug": drug, "level": rule["level"], "note": rule["note"], "score": score})
                break
    hits.sort(key=lambda h: h["score"], reverse=True)
    seen: set[str] = set()
    out: list[dict] = []
    for h in hits:
        if h["drug"]["id"] in seen:
            continue
        seen.add(h["drug"]["id"])
        out.append(h)
    return out[:5]


def lookup_local(drug: dict, condition: str, patient: dict) -> dict:
    ev = evaluate_safety(drug, condition, patient)
    card = build_safety_card(drug, condition, ev, patient)
    return {"status": "ok", "mode": "database", "card": card, "drug": drug, "normalizedQuery": drug["name"]}


def build_structured(card: dict, drug: dict | None = None) -> dict:
    warnings = card.get("warnings") or []
    ci = card.get("contraindications") or []
    dosage = (drug or {}).get("dosage") or "Theo nhãn thuốc hoặc chỉ định dược sĩ/bác sĩ."
    return {
        "drugName": card["drugName"],
        "activeIngredient": card["activeIngredient"],
        "safetyLevel": card["safetyLevel"],
        "safetySummary": card["safetySummary"],
        "condition": card.get("condition", ""),
        "sections": [
            {"n": 1, "title": "Tên thuốc / hoạt chất", "body": f"{card['drugName']} ({card['activeIngredient']})"},
            {"n": 2, "title": "Công dụng", "body": card.get("indications") or "—"},
            {"n": 3, "title": "Cách dùng / liều tham khảo", "body": dosage},
            {"n": 4, "title": "Tác dụng phụ", "body": "; ".join(warnings) if warnings else "Theo tờ hướng dẫn."},
            {"n": 5, "title": "Chống chỉ định / tương tác", "body": "; ".join(ci) if ci else "Hỏi dược sĩ nếu có bệnh nền."},
        ],
        "matchedRules": card.get("matchedRules") or [],
        "sources": card.get("sources") or [],
    }
