"""Streamlit chat-only fallback (?mode=chat)."""

from __future__ import annotations

import json
import re

import streamlit as st

from python.ai_service import ai_lookup, has_openai
from python.bot_flow import (
    INTAKE_PROMPT,
    MAIN_NEEDS,
    SAFETY_DISCLAIMER,
    parse_triage_answer,
    run_safety_checks,
    triage_questions,
)
from python.drug_engine import (
    build_structured,
    detect_urgent,
    extract_patient,
    load_db,
    lookup_local,
    resolve_exact_drug,
    suggest_drug_names,
    suggest_drugs_for_condition,
)

ASSETS = __import__("pathlib").Path(__file__).parent / "assets"
DISCLAIMER = load_db()["meta"]["disclaimer"]


def init_state():
    defaults = {
        "messages": [],
        "bot_step": "welcome",
        "main_need": None,
        "condition": "",
        "drug_query": "",
        "age": None,
        "gender": None,
        "profile": {},
        "pending_drug_pick": None,
        "last_card": None,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def add_bot(text: str):
    st.session_state.messages.append({"role": "assistant", "content": text})


def boot():
    add_bot(
        f"**Long Châu Safety Bot**\n\nXin chào! ⚠️ {SAFETY_DISCLAIMER}\n\n**Chọn nhu cầu A/B/C/D** ở sidebar."
    )
    st.session_state.bot_step = "need_select"


def render_safety_card(result: dict):
    card = result["card"]
    drug = result.get("drug")
    structured = build_structured(card, drug)
    level = card.get("safetyLevel", "yellow")
    emoji = {"green": "🟢", "yellow": "🟡", "red": "🔴"}.get(level, "🟡")
    profile = {"age": st.session_state.age, "gender": st.session_state.gender, **st.session_state.profile}
    checks = run_safety_checks(drug, card, profile)
    lines = [f"### {emoji} Thẻ an toàn — {card['drugName']}", f"**Kết luận:** {card.get('safetySummary', '')}", ""]
    for sec in structured["sections"]:
        lines.append(f"**{sec['n']}. {sec['title']}**  \n{sec['body']}\n")
    for c in checks:
        lines.append(f"- **{c['name']}:** {c['note']}")
    lines.append(f"\n_{DISCLAIMER}_")
    st.session_state.last_card = card
    add_bot("\n".join(lines))


def run_lookup(drug_query: str, drug_id: str | None = None):
    db = load_db()
    condition = st.session_state.condition or "tư vấn chung"
    patient = {"age": st.session_state.age, "gender": st.session_state.gender}
    if detect_urgent(db, condition):
        add_bot("⚠️ **Triệu chứng khẩn cấp** — gọi **115** hoặc đến CSYT.")
        return
    drug = resolve_exact_drug(db, drug_query, drug_id)
    if drug:
        render_safety_card(lookup_local(drug, condition, patient))
        st.session_state.drug_query = drug["name"]
        return
    suggestions = suggest_drug_names(db, drug_query, 5)
    if suggestions:
        add_bot(f"Gợi ý: {', '.join(s['name'] for s in suggestions)} — chọn bên dưới.")
        st.session_state.pending_drug_pick = [s["drug"] for s in suggestions]
        return
    if has_openai():
        with st.spinner("Tra cứu AI..."):
            ai_result = ai_lookup(drug_query, condition, patient)
        if ai_result:
            render_safety_card(ai_result)
            return
    add_bot(f"Không tìm thấy **{drug_query}**.")


def handle_need(need_id: str):
    st.session_state.main_need = need_id
    st.session_state.bot_step = "intake"
    add_bot(f"{INTAKE_PROMPT}")


def handle_intake(text: str):
    age, gender = extract_patient(text)
    if age is not None:
        st.session_state.age = age
    if gender:
        st.session_state.gender = gender
    if st.session_state.age is None or not st.session_state.gender:
        add_bot("Còn thiếu **tuổi/giới tính**.")
        return
    if re.search(r"sốt|đau|ho|ngứa|đau bụng", text, re.I):
        st.session_state.condition = text
    drug_m = re.search(r"(?:thuốc|hoạt chất)\s+([a-zA-Z0-9À-ỹ+\-/]{2,40})", text, re.I)
    if drug_m:
        st.session_state.drug_query = drug_m.group(1)
    need = st.session_state.main_need
    if need == "symptom":
        if not st.session_state.condition:
            st.session_state.bot_step = "symptom_detail"
            add_bot("Mô tả **triệu chứng**.")
            return
        start_triage()
    elif need == "drug":
        if not st.session_state.drug_query:
            st.session_state.bot_step = "drug_detail"
            add_bot("Gõ **tên thuốc**.")
            return
        st.session_state.condition = st.session_state.condition or "tư vấn thuốc"
        run_lookup(st.session_state.drug_query)
        st.session_state.bot_step = "chat"
    elif need == "ocr":
        add_bot("Bấm **Upload ảnh** ở sidebar.")


def start_triage():
    if detect_urgent(load_db(), st.session_state.condition):
        add_bot("⚠️ **Khẩn cấp** — không gợi ý thuốc.")
        return
    qs = triage_questions(st.session_state.condition)
    st.session_state.bot_step = "triage"
    add_bot("**Sàng lọc:** trả lời *tất cả không* hoặc mô tả dấu hiệu có.\n\n" + "\n".join(f"- {q}" for q in qs))


def handle_triage(text: str):
    if parse_triage_answer(text) == "yes":
        add_bot("⚠️ **Nguy hiểm** — đi khám ngay.")
        return
    if st.session_state.main_need == "compatibility" and st.session_state.drug_query:
        run_lookup(st.session_state.drug_query)
    else:
        hits = suggest_drugs_for_condition(load_db(), st.session_state.condition)
        if hits:
            st.session_state.pending_drug_pick = [h["drug"] for h in hits]
            add_bot("Chọn thuốc gợi ý bên dưới.")
    st.session_state.bot_step = "chat"


def process_user(text: str):
    st.session_state.messages.append({"role": "user", "content": text})
    step = st.session_state.bot_step
    if step == "intake" or step == "ocr_wait":
        handle_intake(text)
    elif step == "symptom_detail":
        st.session_state.condition = text
        start_triage()
    elif step == "drug_detail":
        st.session_state.drug_query = text
        run_lookup(text)
        st.session_state.bot_step = "chat"
    elif step == "triage":
        handle_triage(text)
    elif re.search(r"panadol|paracetamol|thuốc", text, re.I):
        handle_intake(text)
        if st.session_state.drug_query and st.session_state.age and st.session_state.gender:
            run_lookup(st.session_state.drug_query)
    else:
        add_bot("Chọn A/B/C/D ở sidebar hoặc mô tả triệu chứng/tên thuốc.")


def main():
    st.set_page_config(page_title="Long Châu Chat", page_icon="💊", layout="wide")
    init_state()
    if not st.session_state.messages:
        boot()
    st.caption("[← Quay lại web đầy đủ](?mode=web)")
    with st.sidebar:
        st.title("Safety Bot")
        for n in MAIN_NEEDS:
            if st.button(f"{n['code']}. {n['title']}", use_container_width=True, key=f"chat_need_{n['id']}"):
                handle_need(n["id"])
                st.rerun()
        st.caption("✅ OpenAI" if has_openai() else "📦 DB demo")
        if st.button("Làm mới"):
            for k in list(st.session_state.keys()):
                del st.session_state[k]
            st.rerun()
    for msg in st.session_state.messages:
        with st.chat_message("user" if msg["role"] == "user" else "assistant"):
            st.markdown(msg["content"])
    if st.session_state.pending_drug_pick:
        for drug in st.session_state.pending_drug_pick:
            if st.button(drug["name"], key=f"pick_{drug['id']}"):
                st.session_state.pending_drug_pick = None
                run_lookup(drug["name"], drug["id"])
                st.rerun()
    if prompt := st.chat_input("Nhập câu hỏi..."):
        process_user(prompt)
        st.rerun()
