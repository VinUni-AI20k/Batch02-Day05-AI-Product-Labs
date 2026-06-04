# Long Châu Safety Bot — Prototype

Chat tra cứu thuốc + Safety Card. Hỗ trợ **OpenAI**, **DeepSeek**, **Gemini** (+ DB local + fuzzy).

## Chạy nhanh

```bash
cd 03-prototype
npm install
cp .env.example .env
npm run dev
```

Mở http://localhost:3000

## Cấu hình API

| Biến | Mục đích |
|------|----------|
| `AI_PROVIDER` | `auto` · `openai` · `deepseek` · `gemini` |
| `OPENAI_API_KEY` | OpenAI — web search / Google CSE |
| `DEEPSEEK_API_KEY` | DeepSeek — chat + Google CSE (nếu có) |
| `GEMINI_API_KEY` | Gemini — Google Search grounding |
| `GOOGLE_API_KEY` + `GOOGLE_CSE_ID` | Nguồn web bổ sung |

### Chọn provider

| `AI_PROVIDER` | Hành vi |
|---------------|---------|
| `auto` | OpenAI → DeepSeek → Gemini (key nào có trước) |
| `deepseek` | Bắt buộc DeepSeek, fallback OpenAI/Gemini |
| `openai` | Bắt buộc OpenAI, fallback DeepSeek/Gemini |
| `gemini` | Bắt buộc Gemini, fallback OpenAI/DeepSeek |

Lấy key:
- DeepSeek: https://platform.deepseek.com/api_keys
- OpenAI: https://platform.openai.com/api-keys
- Gemini: https://aistudio.google.com/apikey

### Logic tra cứu

1. **Thuốc có trong DB** (10 thuốc demo) → Safety Card từ database, **không gọi API**
2. **Gõ sai tên** → gợi ý fuzzy từ DB trước
3. **Thuốc không có trong DB** → mới gọi OpenAI / DeepSeek / Gemini

### Ví dụ cấu hình DeepSeek

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=sk-...
```

## API endpoints

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/drugs/health` | `active`: openai / deepseek / gemini |
| POST | `/api/drugs/lookup` | `{ condition, drugQuery, age, gender }` |

## Port bị chiếm

```bash
lsof -ti:3000 | xargs kill -9 && npm run dev
```

## Deploy Streamlit (Streamlit Community Cloud)

Streamlit **nhúng full web Long Châu** qua iframe (cần server Node). Chat-only: `?mode=chat`.

### Chạy local (khuyên dùng — full web)

**Terminal 1** — web + API:

```bash
cd 03-prototype
npm install
npm run dev
```

**Terminal 2** — Streamlit bọc web:

```bash
cd 03-prototype
pip install -r requirements.txt
streamlit run streamlit_app.py
```

Mở http://localhost:8501 — sẽ thấy **trang Long Châu đầy đủ** (header, hero, sản phẩm, nút Tư vấn).

Hoặc mở trực tiếp http://localhost:3000 (không cần Streamlit).

Streamlit cũng **tự thử khởi động** `npm run dev` nếu port 3000 chưa có ai dùng.

### Chỉ chat (không web)

http://localhost:8501/?mode=chat

### Deploy Streamlit Cloud

Streamlit Cloud **không chạy Node** — trên cloud chỉ dùng `?mode=chat` hoặc deploy web riêng (Vercel/Render cho `npm run dev`).

1. Push repo GitHub → [share.streamlit.io](https://share.streamlit.io)
2. Main file: `streamlit_app.py` (root) hoặc `03-prototype/streamlit_app.py`
3. Secrets (tuỳ chọn): `OPENAI_API_KEY`
