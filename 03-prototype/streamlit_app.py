"""
Long Châu Safety Bot — Streamlit wrapper
Hiển thị full web Long Châu (index.html + chat panel) qua iframe.
Tự khởi động server Node nếu chưa chạy.

Chạy: streamlit run streamlit_app.py
"""

from __future__ import annotations

import socket
import subprocess
import time
from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components

ROOT = Path(__file__).resolve().parent
NODE_PORT = int(__import__("os").environ.get("LC_PORT", "3000"))
EMBED_URL = __import__("os").environ.get("LC_EMBED_URL", f"http://127.0.0.1:{NODE_PORT}")


def _port_open(host: str, port: int) -> bool:
    try:
        with socket.create_connection((host, port), timeout=0.4):
            return True
    except OSError:
        return False


def _start_node_server() -> subprocess.Popen | None:
    if not (ROOT / "node_modules").is_dir():
        return None
    try:
        proc = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=str(ROOT),
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            start_new_session=True,
        )
        return proc
    except OSError:
        return None


def ensure_web_server() -> str | None:
    if _port_open("127.0.0.1", NODE_PORT):
        return f"http://127.0.0.1:{NODE_PORT}"

    if st.session_state.get("node_proc") and st.session_state.node_proc.poll() is None:
        pass
    elif not st.session_state.get("node_start_attempted"):
        st.session_state.node_start_attempted = True
        proc = _start_node_server()
        if proc:
            st.session_state.node_proc = proc

    for _ in range(40):
        if _port_open("127.0.0.1", NODE_PORT):
            return f"http://127.0.0.1:{NODE_PORT}"
        time.sleep(0.25)

    return None


def hide_streamlit_chrome():
    st.markdown(
        """
        <style>
          #MainMenu, footer, header { visibility: hidden; height: 0; }
          .block-container {
            padding: 0 !important;
            max-width: 100% !important;
          }
          [data-testid="stSidebar"] { display: none; }
          [data-testid="stAppViewContainer"] { margin-top: -3rem; }
          iframe { border: none !important; }
        </style>
        """,
        unsafe_allow_html=True,
    )


def render_chat_fallback():
    """Chat-only mode — ?mode=chat"""
    from streamlit_chat import main as chat_main

    chat_main()


def main():
    mode = st.query_params.get("mode", "web")

    if mode == "chat":
        render_chat_fallback()
        return

    st.set_page_config(
        page_title="Nhà thuốc Long Châu — Safety Bot",
        page_icon="💊",
        layout="wide",
        initial_sidebar_state="collapsed",
    )
    hide_streamlit_chrome()

    url = EMBED_URL if _port_open("127.0.0.1", NODE_PORT) else ensure_web_server()

    if not url:
        st.error("Không kết nối được web Long Châu.")
        st.markdown(
            f"""
**Cách 1 — chạy server Node trước (khuyên dùng):**

```bash
cd 03-prototype
npm install
npm run dev
```

Sau đó mở lại Streamlit hoặc truy cập trực tiếp: [http://localhost:{NODE_PORT}](http://localhost:{NODE_PORT})

**Cách 2 — chỉ chat (không có giao diện web):**

Thêm `?mode=chat` vào URL Streamlit hoặc chạy chat-only.
            """
        )
        if st.button("Thử khởi động lại server Node"):
            st.session_state.node_start_attempted = False
            st.rerun()
        st.page_link("?mode=chat", label="Mở chat-only (không có giao diện web)")
        return

    components.html(
        f"""
        <iframe
          src="{url}"
          title="Nhà thuốc Long Châu"
          style="width:100%;height:100vh;border:none;display:block;background:#eef6ff;"
          allow="clipboard-read; clipboard-write"
        ></iframe>
        """,
        height=820,
        scrolling=False,
    )


if __name__ == "__main__":
    main()
