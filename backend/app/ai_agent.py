import re
from typing import List, Dict, Any
from .schemas import RecommendResponse, SuggestionItem, Coords, HistoryItem, UserLocation
from .pre_filter import parse_budget_limit

def get_recommendations(
    candidates: List[Dict[str, Any]],
    message: str,
    history: List[HistoryItem],
    coords: Coords
) -> RecommendResponse:
    """
    Mock AI Agent simulating structured outputs from a Large Language Model.
    
    FOR MEMBER C (AI Agent & Prompt Engineer):
    -------------------------------------------------------------------------
    This function currently mocks the LLM logic to support quick frontend testing 
    and validate the 12 fallback scenarios. 
    
    To integrate Gemini/OpenAI API:
    1. Install `google-generativeai` or `openai` in requirements.txt.
    2. Import the SDK here.
    3. Construct your System Prompt using the system instructions in spec.md.
    4. Call the LLM with structured output (using Pydantic models).
    5. Pass the `candidates` (pre-filtered top 10 list) to the model.
    6. Return the parsed model output as a `RecommendResponse`.
    -------------------------------------------------------------------------
    """
    msg_lower = message.lower().strip()
    
    # --- TC-08: Lạc đề (Out of topic) ---
    # Detect weather, news, politics or general non-food prompts
    out_of_topic_keywords = [
        "thời tiết", "nhiệt độ", "mưa", "nắng", "ngày mai", "tin tức", 
        "thể thao", "bóng đá", "chính trị", "học tập", "code"
    ]
    if any(kw in msg_lower for kw in out_of_topic_keywords):
        return RecommendResponse(
            action="clarify",
            clarify_question="Mình chỉ giúp chọn món thôi nha — bạn đang muốn ăn gì?",
            suggestions=[]
        )
        
    # --- TC-11: Y tế / Dinh dưỡng (Medical/Nutrition) ---
    medical_keywords = [
        "đau dạ dày", "đau bao tử", "giảm cân", "béo phì", "chữa bệnh", 
        "thuốc", "bị ốm", "bị sốt", "tiểu đường"
    ]
    if any(kw in msg_lower for kw in medical_keywords):
        return RecommendResponse(
            action="clarify",
            clarify_question="Mình chỉ gợi ý món ăn thôi nè. Nếu bạn mệt hoặc đau dạ dày, mình gợi ý cháo hoặc súp nhẹ bụng nha! Bạn nên hỏi thêm ý kiến bác sĩ nhé.",
            suggestions=[]
        )
        
    # --- TC-10: Out of scope (AI tự đặt đơn) ---
    order_keywords = [
        "đặt giúp", "đặt hộ", "thanh toán hộ", "order giúp", "mua giùm", "thanh toán luôn"
    ]
    if any(kw in msg_lower for kw in order_keywords):
        return RecommendResponse(
            action="clarify",
            clarify_question="Mình chỉ đóng vai trò trợ lý gợi ý thôi nè. Bạn hãy chọn món mình thích trong các thẻ bên dưới rồi bấm để tự đặt trên app ShopeeFood nha!",
            suggestions=[]
        )

    # --- TC-05 / TC-06: Empty candidates (No restaurants / Budget impossible) ---
    if not candidates:
        budget_limit = parse_budget_limit(message)
        if budget_limit is not None and budget_limit < 20000:
            # TC-06 Fallback
            return RecommendResponse(
                action="clarify",
                clarify_question=f"Quanh bạn chưa có món nào giá dưới {budget_limit:,}đ hết trơn. Bạn thử nâng ngân sách lên khoảng 40k-50k nha!",
                suggestions=[]
            )
        else:
            # TC-05 Fallback
            return RecommendResponse(
                action="clarify",
                clarify_question="Tiếc quá, hiện tại quanh bạn không có quán nào đang mở cửa hoặc nằm trong bán kính 3km cả. Bạn thử đổi địa chỉ hoặc quay lại sau nha!",
                suggestions=[]
            )

    # --- TC-03: Mơ hồ (Vague Intent) ---
    # Detect empty/very brief chat prompts (e.g. "đặt gì giờ", "hello", "hi")
    vague_keywords = ["đặt gì giờ", "ăn gì giờ", "hello", "hi", "xin chào", "ăn gì ngon", "đói quá"]
    is_vague = msg_lower == "" or any(kw == msg_lower for kw in vague_keywords)
    
    if is_vague:
        # Check if we have clarified in history (TC-03 Fallback)
        has_previous_clarify = any(
            h.role == "assistant" and "muốn ăn" in h.content 
            for h in history
        )
        if has_previous_clarify:
            # User remains vague after clarification -> Return general popular recommendations
            selected_items = candidates[:min(3, len(candidates))]
            suggestions = []
            for item in selected_items:
                suggestions.append(SuggestionItem(
                    restaurant_id=item["restaurant_id"],
                    restaurant_name=item["restaurant_name"],
                    dish_name=item["dish_name"],
                    price=item["price"],
                    distance_km=item["distance_km"],
                    eta_minutes=item["eta_minutes"],
                    reason="Món bán chạy quanh bạn, được nhiều người dùng tin cậy."
                ))
            return RecommendResponse(
                action="suggest",
                clarify_question="",
                suggestions=suggestions
            )
        else:
            # Ask clarifying question
            return RecommendResponse(
                action="clarify",
                clarify_question="Chào bạn! Bạn đang muốn ăn món nước nóng hổi hay món khô tiện lợi, và ngân sách khoảng bao nhiêu nè?",
                suggestions=[]
            )

    # --- TC-01 & TC-02 & TC-04: Happy Path (1 to 3 suggestions) ---
    # Take top 3 candidates (or 1-2 if that's all we have)
    num_suggestions = min(3, len(candidates))
    selected_candidates = candidates[:num_suggestions]
    
    suggestions = []
    for cand in selected_candidates:
        price = cand["price"]
        dist = cand["distance_km"]
        dish = cand["dish_name"]
        
        # Build reason (< 12 words) dynamically matching user priority
        if coords.hot > 0.6 and ("nóng" in cand["tags"] or "nước" in cand["tags"]):
            reason = f"Món nước nóng hổi đúng ý bạn, giá {price//1000}k và cách {dist}km."
        elif coords.cheap > 0.6:
            reason = f"Món ngon giá hời chỉ {price//1000}k, cách bạn {dist}km."
        elif coords.near > 0.6:
            reason = f"Quán cực gần chỉ {dist}km, giao nhanh ăn liền!"
        else:
            # Balanced priority or custom filters
            reason = f"Món {dish} nóng ngon, giá {price//1000}k phù hợp khẩu vị của bạn."
            
        suggestions.append(SuggestionItem(
            restaurant_id=cand["restaurant_id"],
            restaurant_name=cand["restaurant_name"],
            dish_name=dish,
            price=price,
            distance_km=dist,
            eta_minutes=cand["eta_minutes"],
            reason=reason
        ))
        
    return RecommendResponse(
        action="suggest",
        clarify_question="",
        suggestions=suggestions
    )

if __name__ == "__main__":
    # Script test truc tiep tu terminal
    # Luu y chay tu thu muc 'backend': python -m app.ai_agent
    import sys
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')

    print("=== KIỂM THỬ ĐỘC LẬP AI AGENT ===")
    
    # Giả lập danh sách ứng viên sau khi chạy bộ tiền lọc
    mock_candidates = [
        {
            "restaurant_id": "res_001",
            "restaurant_name": "Bún Bò Cô Ba",
            "dish_name": "Bún Bò Nạm Lớn",
            "price": 45000,
            "distance_km": 0.8,
            "eta_minutes": 15,
            "tags": ["nóng", "nước", "mặn"]
        },
        {
            "restaurant_id": "res_002",
            "restaurant_name": "Cơm Tấm Phúc Lộc Thọ",
            "dish_name": "Cơm Sườn Bì Chả",
            "price": 48000,
            "distance_km": 1.2,
            "eta_minutes": 18,
            "tags": ["nóng", "khô", "mặn"]
        }
    ]
    
    test_coords = Coords(hot=0.8, cheap=0.9, near=0.7)
    
    # Test case 1: Happy Path
    print("\nCase 1: Happy Path ('Món gì nóng rẻ gần đây')")
    res1 = get_recommendations(mock_candidates, "Món gì nóng rẻ gần đây", [], test_coords)
    print(f"Action: {res1.action}")
    for s in res1.suggestions:
        print(f"  - {s.restaurant_name} | {s.dish_name} | {s.price}đ | Lý do: {s.reason}")
        
    # Test case 2: Lạc đề
    print("\nCase 2: Lạc đề ('Thời tiết mai ra sao')")
    res2 = get_recommendations(mock_candidates, "Thời tiết mai ra sao", [], test_coords)
    print(f"Action: {res2.action} | Câu hỏi: {res2.clarify_question}")

