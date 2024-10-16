import PyInstaller.__main__
import os
from dotenv import load_dotenv

load_dotenv()
dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist', 'doc-intelligence'))

PyInstaller.__main__.run([
    'analyze_doc.py',
    '--collect-all=pypdfium2',
    '--collect-all=pypdfium2_raw',
    "--noconfirm",
    f'--distpath={dist_path}',
])
