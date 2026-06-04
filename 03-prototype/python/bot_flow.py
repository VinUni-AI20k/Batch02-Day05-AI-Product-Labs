"""Bot flow constants and triage — Streamlit."""

from __future__ import annotations

import re

MAIN_NEEDS = [
    {"id": "symptom", "code": "A", "title": "Tôi đang có triệu chứng", "hint": "Gợi ý thuốc OTC sau sàng lọc an toàn"},
    {"id": "drug", "code": "B", "title": "Hỏi về thuốc/hoạt chất", "hint": "Tra công dụng, liều, tác dụng phụ"},
    {"id": "ocr", "code": "C", "title": "Chụp ảnh thuốc/đơn", "hint": "Upload ảnh nhãn thuốc"},
    {"id": "compatibility", "code": "D", "title": "Kiểm tra thuốc phù hợp tình trạng", "hint": "Đối chiếu với bệnh nền, tuổi"},
]

SAFETY_DISCLAIMER = (
    "Bot không thay thế bác sĩ, không tự kê đơn thuốc. Thông tin chỉ mang tính tham khảo."
)

INTAKE_PROMPT = """Để kiểm tra an toàn, mình cần:
• Tuổi, giới tính
• Cân nặng (nếu biết), mang thai/cho bú
• Bệnh nền, dị ứng, thuốc đang dùng
• Thời gian triệu chứng (nếu có)

_Vd: 30 tuổi, nữ, sốt 2 ngày, không mang thai, không dị ứng_"""

TRIAGE_ABDOMINAL = [
    "Đau dữ dội hoặc đau tăng nhanh?",
    "Có sốt cao?",
    "Nôn liên tục?",
    "Đi ngoài ra máu/phân đen?",
    "Đau bụng kèm khó thở/đau ngực?",
    "Phụ nữ có thai bị đau bụng?",
    "Trẻ nhỏ/người già mất nước nặng?",
]

TRIAGE_DEFAULT = [
    "Triệu chứng đột ngột, dữ dội hoặc tệ đi nhanh?",
    "Khó thở, đau ngực, choáng hoặc ngất?",
    "Chảy máu bất thường, phản vệ, sưng mặt?",
    "Mang thai/cho bú và triệu chứng nặng?",
]


def triage_questions(condition: str) -> list[str]:
    if re.search(r"đau bụng", condition or "", re.I):
        return TRIAGE_ABDOMINAL
    return TRIAGE_DEFAULT


def parse_triage_answer(text: str) -> str | None:
    t = text.strip().lower()
    if re.search(r"tất cả\s*(đều\s*)?không|không có|toàn không|không gì", t):
        return "no"
    if re.search(r"^(có|co|yes)\b|(^|\s)(có|co)(\s|$)", t):
        return "yes"
    if re.search(r"^(không|khong|no)\b|(^|\s)(không|khong)(\s|$)", t):
        return "no"
    if re.search(r"nguy hiểm|có dấu hiệu|nặng", t):
        return "yes"
    return None


def run_safety_checks(drug: dict | None, card: dict, profile: dict) -> list[dict]:
    age = profile.get("age")
    checks = []
    risk = (age is not None and age < 2) or (age is not None and age >= 65) or profile.get("pregnancy")
    checks.append(("Nhóm nguy cơ", "warn" if risk else "pass", "Trẻ nhỏ/cao tuổi/thai kỳ cần thận trọng." if risk else "Chưa ghi nhận nhóm nguy cơ đặc biệt."))
    allergy = bool(profile.get("allergies"))
    checks.append(("Dị ứng hoạt chất", "warn" if allergy else "pass", "Đã khai dị ứng — cần đối chiếu." if allergy else "Chưa khai dị ứng."))
    level = card.get("safetyLevel", "yellow")
    checks.append(("Bệnh nền / chống chỉ định", "fail" if level == "red" else "warn" if level == "yellow" else "pass", card.get("safetySummary", "")))
    meds = bool(profile.get("medications"))
    checks.append(("Tương tác thuốc đang dùng", "warn" if meds else "pass", "Có thuốc đang dùng — hỏi dược sĩ." if meds else "Chưa ghi nhận thuốc khác."))
    is_rx = drug and drug.get("otc") is False
    checks.append(("OTC / kê đơn", "warn" if is_rx else "pass", "Thuốc kê đơn — không tự mua." if is_rx else "Thuốc OTC thường gặp."))
    checks.append(("Phù hợp công dụng", "pass" if level == "green" else "warn", card.get("safetySummary", "")))
    return [{"name": n, "status": s, "note": note} for n, s, note in checks]
