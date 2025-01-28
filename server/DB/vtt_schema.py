from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class VTT(BaseModel):
    video_id: int
    language: str
    format: str
    content: str
