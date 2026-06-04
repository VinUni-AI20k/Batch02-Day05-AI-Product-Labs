"""
Entry point for Streamlit Community Cloud (repo root).
Deploy: Main file = streamlit_app.py, Python 3.11+
"""
import importlib.util
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "03-prototype"
os.chdir(ROOT)
sys.path.insert(0, str(ROOT))

_spec = importlib.util.spec_from_file_location("lc_streamlit", ROOT / "streamlit_app.py")
_mod = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(_mod)
_mod.main()
