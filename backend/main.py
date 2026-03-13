import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app_factory import create_app


app = create_app()