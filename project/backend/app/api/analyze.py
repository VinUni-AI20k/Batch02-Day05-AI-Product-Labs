"""
====================================================
  API Endpoint: /api/analyze
  Phân tích hồ sơ người học và tạo lộ trình cá nhân
  VinUni AI20k Batch 02 · Day 05
====================================================
"""

import os
import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
import httpx

from middleware.cost_logger import log_cost

logger = logging.getLogger(__name__)
router = APIRouter()

# Đọc System Prompt từ file
SYSTEM_PROMPT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "..", "..", "prompts", "system_prompt.txt"
)

def load_system_prompt() -> str:
    try:
        with open(SYSTEM_PROMPT_PATH, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        logger.warning("⚠️ System prompt file không tìm thấy, dùng prompt mặc định")
        return "You are an AI learning path advisor. Return JSON with milestones."


# ==================== REQUEST/RESPONSE MODELS ====================

class AnalyzeRequest(BaseModel):
    user_id: str
    session_id: str
    goal_description: str = Field(..., min_length=10, max_length=2000)
    quiz_answers: List[Optional[int]] = Field(..., min_items=1, max_items=10)
    time_per_week: str
    current_job: str
    background: Optional[str] = "none"
    quiz_score: Optional[int] = 0


class Milestone(BaseModel):
    milestone_title: str
    duration: str
    resource_links: List[str]
    difficulty: str  # beginner | intermediate | advanced
    description: str


class AnalyzeResponse(BaseModel):
    milestones: List[Milestone]
    confidence_score: float
    path_type: str          # happy | low_conf | failure
    reasoning: str
    personalization_notes: str
    cost_info: dict


# ==================== ENDPOINT ====================

@router.post("/analyze", response_model=AnalyzeResponse, summary="Phân tích hồ sơ và tạo lộ trình học")
async def analyze_profile(req: AnalyzeRequest):
    """
    Nhận thông tin người học từ Form + Quiz, gọi LLM API,
    trả về lộ trình học cá nhân hóa dạng JSON.
    
    Luồng xử lý:
    1. Validate input
    2. Build prompt từ user data
    3. Gọi OpenAI / Gemini API (temperature=0.2, JSON mode)
    4. Parse và validate JSON response
    5. Ghi log chi phí
    6. Xác định path_type dựa trên confidence_score
    7. Return kết quả
    """
    
    logger.info(f"📊 Analyze request | user={req.user_id} | job={req.current_job} | score={req.quiz_score}/10")
    
    # Build user context prompt
    quiz_summary = f"Điểm quiz: {req.quiz_score}/10"
    if req.quiz_answers:
        correct_topics = []
        quiz_topics = [
            "Toán học", "Xác suất", "Đại số tuyến tính", "ML cơ bản",
            "Overfitting", "Gradient Descent", "Python", "Deep Learning",
            "Loss Function", "Transfer Learning"
        ]
        for i, ans in enumerate(req.quiz_answers):
            if ans is not None and i < len(quiz_topics):
                correct_topics.append(quiz_topics[i])
        quiz_summary += f"\nCác topic đã trả lời: {', '.join(correct_topics) if correct_topics else 'Chưa có'}"

    user_prompt = f"""
Hãy phân tích hồ sơ người học và thiết kế lộ trình học AI cá nhân hóa:

THÔNG TIN NGƯỜI HỌC:
- Mục tiêu: {req.goal_description}
- Công việc hiện tại: {req.current_job}
- Thời gian học mỗi tuần: {req.time_per_week}
- Nền tảng kỹ thuật: {req.background}
- {quiz_summary}

Trả về JSON theo đúng schema đã định nghĩa. KHÔNG thêm text ngoài JSON.
"""

    # Gọi LLM API
    model = os.getenv("MODEL_NAME", "gpt-4o-mini")
    model_lower = model.lower()
    
    roadmap_data = None
    input_tokens = 0
    output_tokens = 0
    
    if "gpt" in model_lower:
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    response = await client.post(
                        "https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {api_key}"},
                        json={
                            "model": model,
                            "messages": [
                                {"role": "system", "content": load_system_prompt()},
                                {"role": "user", "content": user_prompt}
                            ],
                            "temperature": 0.2,          # Cố định để đảm bảo nhất quán
                            "response_format": {"type": "json_object"},  # JSON mode
                            "max_tokens": 2000
                        }
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    raw_content = data["choices"][0]["message"]["content"]
                    roadmap_data = json.loads(raw_content)
                    
                    # Lấy token usage
                    usage = data.get("usage", {})
                    input_tokens = usage.get("prompt_tokens", 0)
                    output_tokens = usage.get("completion_tokens", 0)
                    
            except json.JSONDecodeError as e:
                logger.error(f"❌ JSON parse error: {e}")
                roadmap_data = None
            except httpx.HTTPStatusError as e:
                logger.error(f"❌ OpenAI API error: {e.response.status_code}")
                roadmap_data = None
            except Exception as e:
                logger.error(f"❌ Unexpected error calling OpenAI: {e}")
                roadmap_data = None
                
    elif "gemini" in model_lower:
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                import google.generativeai as genai
                import asyncio
                
                genai.configure(api_key=api_key)
                gemini_model = genai.GenerativeModel(
                    model_name=model,
                    system_instruction=load_system_prompt(),
                    generation_config=genai.GenerationConfig(
                        temperature=0.2,
                        response_mime_type="application/json",
                        max_output_tokens=2048,
                    )
                )
                
                # Gọi đồng bộ thông qua to_thread để tránh block event loop
                response = await asyncio.to_thread(gemini_model.generate_content, user_prompt)
                raw_content = response.text
                roadmap_data = json.loads(raw_content)
                
                # Lấy token usage
                usage = response.usage_metadata
                input_tokens = usage.prompt_token_count if usage else 200
                output_tokens = usage.candidates_token_count if usage else 500
                
            except json.JSONDecodeError as e:
                logger.error(f"❌ JSON parse error from Gemini: {e}")
                roadmap_data = None
            except Exception as e:
                logger.error(f"❌ Unexpected error calling Gemini: {e}")
                roadmap_data = None
    else:
        logger.warning(f"⚠️ Không nhận dạng được model: {model}, dùng default fallback")
    
    # Fallback nếu API không hoạt động hoặc không có key
    if roadmap_data is None:
        logger.warning("⚠️ Dùng fallback roadmap")
        roadmap_data = _get_fallback_roadmap(req.quiz_score, req.background, req.goal_description)
        input_tokens = 0
        output_tokens = 0
    
    # Ghi log chi phí
    cost_info = log_cost(
        user_id=req.user_id,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        model_name=model,
        session_id=req.session_id,
        confidence_score=roadmap_data.get("confidence_score", 0.5),
        endpoint="/api/analyze"
    )
    
    # Validate và trả về kết quả
    try:
        return AnalyzeResponse(
            milestones=[Milestone(**m) for m in roadmap_data.get("milestones", [])],
            confidence_score=float(roadmap_data.get("confidence_score", 0.5)),
            path_type=roadmap_data.get("path_type", "low_conf"),
            reasoning=roadmap_data.get("reasoning", "Phân tích tự động"),
            personalization_notes=roadmap_data.get("personalization_notes", ""),
            cost_info=cost_info
        )
    except Exception as e:
        logger.error(f"❌ Response validation error: {e}")
        raise HTTPException(status_code=500, detail="Lỗi xử lý kết quả AI. Vui lòng thử lại.")


def _get_fallback_roadmap(quiz_score: int, background: str, goal: str) -> dict:
    """Lộ trình mặc định khi API không hoạt động"""
    return {
        "milestones": [
            {
                "milestone_title": "🌱 Nền tảng AI cho người mới",
                "duration": "Tuần 1-2 (4-6 giờ)",
                "resource_links": ["https://www.elementsofai.com", "https://kaggle.com/learn"],
                "difficulty": "beginner",
                "description": "Hiểu AI là gì, ứng dụng thực tế, và bắt đầu hành trình học AI đúng hướng."
            },
            {
                "milestone_title": "📊 Data & Thống kê cơ bản",
                "duration": "Tuần 3-4 (5-8 giờ)",
                "resource_links": ["https://www.khanacademy.org/math/statistics-probability"],
                "difficulty": "beginner",
                "description": "Thống kê mô tả, xác suất cơ bản, biểu đồ dữ liệu. Nền tảng không thể thiếu cho ML."
            },
            {
                "milestone_title": "🛠️ Công cụ AI thực hành",
                "duration": "Tuần 5-6 (5-7 giờ)",
                "resource_links": ["https://openai.com/chatgpt", "https://claude.ai"],
                "difficulty": "intermediate",
                "description": "Thực hành với các AI tools phổ biến, Prompt Engineering cơ bản, ứng dụng vào công việc."
            }
        ],
        "confidence_score": 0.55,
        "path_type": "low_conf",
        "reasoning": "API không khả dụng, hiển thị lộ trình cơ bản chuẩn VinUni.",
        "personalization_notes": "Lộ trình mặc định - chưa được cá nhân hóa."
    }
